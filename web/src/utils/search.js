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
