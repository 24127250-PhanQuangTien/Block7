export function normalizeSearch(value = "")
{
  return String(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

export function filterChefs(chefs, query)
{
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return chefs.filter((chef) =>
  {
    const text = normalizeSearch(`${chef.name} ${chef.specialty || ""}`);
    return terms.every((term) => text.includes(term));
  });
}

export function filterChefNames(chefs, query)
{
  const text = normalizeSearch(query);
  return chefs.filter((chef) => normalizeSearch(chef.name).includes(text));
}

function singleEditPattern(term)
{
  const letters = Array.from(term);
  if (letters.length < 4) return new RegExp(`^${term}$`, "u");
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
  return new RegExp(`^(${[...alternatives].join("|")})$`, "u");
}

export function filterIngredientNames(ingredients, { q = "", category = "", unit = "" } = {})
{
  const terms = [...new Set(normalizeSearch(q).match(/[\p{L}\p{N}]+/gu) || [])];
  const patterns = terms.map(singleEditPattern);
  const selectedCategory = normalizeSearch(category);
  const selectedUnit = normalizeSearch(unit);
  return ingredients.map((ingredient) =>
  {
    if (selectedCategory && !["tat ca", "all"].includes(selectedCategory) && normalizeSearch(ingredient.category || "Khác") !== selectedCategory) return null;
    if (selectedUnit && normalizeSearch(ingredient.unit) !== selectedUnit) return null;
    if (!q.trim()) return { ingredient, score: 1 };
    if (!terms.length) return null;
    const words = normalizeSearch(ingredient.name).match(/[\p{L}\p{N}]+/gu) || [];
    let total = 0;
    for (let index = 0; index < terms.length; index += 1)
    {
      const score = words.includes(terms[index]) ? 1 : words.some((word) => patterns[index].test(word)) ? 0.75 : 0;
      if (!score) return null;
      total += score;
    }
    return { ingredient, score: total / terms.length };
  }).filter(Boolean).sort((left, right) => right.score - left.score || left.ingredient.id - right.ingredient.id)
    .map(({ ingredient }) => ingredient);
}

export function buildDishSearchParams(params, match, page = params.get("page") || "1")
{
  const result = {
    mode: "advanced",
    match,
    page,
    pageSize: params.get("pageSize") || "10",
    sort: params.get("sort") || "id_asc",
  };
  for (const key of ["q", "category", "minPrice", "maxPrice", "available"])
  {
    const value = params.get(key);
    if (value !== null && value.trim() !== "")
    {
      result[key] = value.trim();
    }
  }
  if (!params.has("available") && ["available", "unavailable"].includes(params.get("status")))
  {
    result.available = params.get("status") === "available" ? "true" : "false";
  }
  return result;
}
