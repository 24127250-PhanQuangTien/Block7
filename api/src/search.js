const { Prisma } = require("@prisma/client");

const FUZZY_SIMILARITY_THRESHOLD = 0.3;
const combiningMarks = `[${String.fromCodePoint(0x0300)}-${String.fromCodePoint(0x036f)}]`;

function normalizeSearchSql(value)
{
  // NFD tách dấu thanh và dấu nguyên âm; đ/Đ cần chuyển riêng.
  return Prisma.sql`lower(translate(regexp_replace(normalize(coalesce(${value}, ''), NFD), ${combiningMarks}, '', 'g'), 'đĐ', 'dD'))`;
}

function singleEditPattern(term)
{
  const letters = Array.from(term);
  if (letters.length < 4) return `^${term}$`;
  const alternatives = new Set([term]);
  for (let index = 0; index < letters.length; index += 1)
  {
    const before = letters.slice(0, index).join("");
    const after = letters.slice(index + 1).join("");
    alternatives.add(before + after);
    alternatives.add(before + "." + after);
    if (index + 1 < letters.length)
    {
      alternatives.add(before + letters[index + 1] + letters[index] + letters.slice(index + 2).join(""));
    }
  }
  for (let index = 0; index <= letters.length; index += 1)
  {
    alternatives.add(letters.slice(0, index).join("") + "." + letters.slice(index).join(""));
  }
  return `^(${[...alternatives].join("|")})$`;
}

function fuzzyScoreSql(name, query)
{
  const normalizedName = normalizeSearchSql(name);
  const terms = [...new Set(String(query).normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])];
  if (!terms.length) return Prisma.sql`0::float8`;
  const queryTerms = terms.map((term) => Prisma.sql`(${term}, ${singleEditPattern(term)})`);
  // Với giới hạn một lỗi, các mẫu này tương đương khoảng cách Damerau–Levenshtein <= 1.
  // Mọi từ phải khớp; điểm trung bình ưu tiên kết quả cần ít sửa hơn.
  return Prisma.sql`(
    SELECT CASE WHEN min(term_score) = 0 THEN 0::float8 ELSE avg(term_score) END
    FROM (
      SELECT coalesce((
        SELECT max(CASE
          WHEN name_term = query_terms.term THEN 1::float8
          WHEN name_term ~ query_terms.pattern THEN 0.75::float8
          ELSE 0::float8
        END)
        FROM regexp_split_to_table(${normalizedName}, '[^[:alnum:]]+') AS name_terms(name_term)
        WHERE name_term <> ''
      ), 0::float8) AS term_score
      FROM (VALUES ${Prisma.join(queryTerms)}) AS query_terms(term, pattern)
    ) AS term_scores
  )`;
}

function dishFuzzyScoreSql(query)
{
  const nameScore = fuzzyScoreSql(Prisma.sql`d.name`, query);
  const ingredientScore = fuzzyScoreSql(Prisma.sql`search_ingredient.name`, query);
  // Tất cả từ khóa phải khớp tên món hoặc cùng một nguyên liệu đã liên kết.
  return Prisma.sql`greatest(${nameScore}, (
    SELECT coalesce(max(${ingredientScore}), 0)
    FROM "_DishToIngredient" search_link
    JOIN ingredients search_ingredient ON search_ingredient.id = search_link."B"
    WHERE search_link."A" = d.id
  ))`;
}

function dishFulltextDocumentSql()
{
  const document = Prisma.sql`coalesce(d.name, '') || ' ' || coalesce(d.description, '') || ' ' || coalesce((
    SELECT string_agg(search_ingredient.name, ' ' ORDER BY search_ingredient.id)
    FROM "_DishToIngredient" search_link
    JOIN ingredients search_ingredient ON search_ingredient.id = search_link."B"
    WHERE search_link."A" = d.id
  ), '')`;
  return Prisma.sql`to_tsvector('simple', ${normalizeSearchSql(document)})`;
}

module.exports = { fuzzyScoreSql, dishFuzzyScoreSql, dishFulltextDocumentSql, normalizeSearchSql, FUZZY_SIMILARITY_THRESHOLD };
