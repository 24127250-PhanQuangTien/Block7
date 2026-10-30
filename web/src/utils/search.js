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
