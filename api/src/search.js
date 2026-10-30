const { Prisma } = require("@prisma/client");

const FUZZY_SIMILARITY_THRESHOLD = 0.3;
const combiningMarks = `[${String.fromCodePoint(0x0300)}-${String.fromCodePoint(0x036f)}]`;

function normalizeSearchSql(value)
{
  // NFD tách dấu thanh và dấu nguyên âm; đ/Đ cần chuyển riêng.
  return Prisma.sql`lower(translate(regexp_replace(normalize(coalesce(${value}, ''), NFD), ${combiningMarks}, '', 'g'), 'đĐ', 'dD'))`;
}

function fuzzyScoreSql(name, query)
{
  const normalizedName = normalizeSearchSql(name);
  const normalizedQuery = normalizeSearchSql(query);
  // Mỗi từ phải khớp một từ trong tên; điểm thấp nhất quyết định kết quả.
  // Dùng ranh giới từ để tránh khớp một mẩu ký tự nằm trong từ không liên quan.
  return Prisma.sql`(
    SELECT coalesce(min(strict_word_similarity(fuzzy_term, ${normalizedName})), 0)
    FROM regexp_split_to_table(${normalizedQuery}, '[^[:alnum:]]+') AS fuzzy_terms(fuzzy_term)
    WHERE fuzzy_term <> ''
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
