// Tiện ích phân loại và hiển thị tag nguyên liệu

export const INGREDIENT_TAGS = [
  "Tất cả",
  "Gia vị",
  "Rau",
  "Bún",
  "Thịt",
  "Hải sản",
];

export const ALL_INGREDIENT_CATEGORIES = [
  "Gia vị",
  "Rau",
  "Bún",
  "Thịt",
  "Hải sản",
  "Khác",
];

export function getIngredientCategory(ing) {
  if (ing && ing.category && ing.category !== "Khác") {
    return ing.category;
  }

  const n = ((ing && ing.name) || "").toLowerCase();

  // Bún / Phở / Tinh bột
  if (
    n.includes("phở") ||
    n.includes("bún") ||
    n.includes("gạo") ||
    n.includes("mì") ||
    n.includes("miến") ||
    n.includes("hủ tiếu") ||
    n.includes("bột") ||
    n.includes("bánh tráng")
  ) {
    return "Bún";
  }

  // Thịt
  if (
    n.includes("bò") ||
    n.includes("heo") ||
    n.includes("thịt") ||
    n.includes("sườn") ||
    n.includes("gà") ||
    n.includes("giò") ||
    n.includes("vịt")
  ) {
    return "Thịt";
  }

  // Gia vị
  if (
    n.includes("mắm") ||
    n.includes("muối") ||
    n.includes("đường") ||
    n.includes("tiêu") ||
    n.includes("dầu") ||
    n.includes("hành tím") ||
    n.includes("tỏi") ||
    n.includes("gừng") ||
    n.includes("sả") ||
    n.includes("ớt") ||
    n.includes("giấm") ||
    n.includes("sa tế") ||
    n.includes("ngũ vị") ||
    n.includes("hạt nêm") ||
    n.includes("bột ngọt") ||
    n.includes("hương")
  ) {
    return "Gia vị";
  }

  // Rau củ quả
  if (
    n.includes("rau") ||
    n.includes("ngò") ||
    n.includes("hành lá") ||
    n.includes("sen") ||
    n.includes("cải") ||
    n.includes("nấm") ||
    n.includes("giá") ||
    n.includes("dưa") ||
    n.includes("cà") ||
    n.includes("khoai") ||
    n.includes("chanh") ||
    n.includes("bắp") ||
    n.includes("quế")
  ) {
    return "Rau";
  }

  // Hải sản
  if (
    n.includes("tôm") ||
    n.includes("cua") ||
    n.includes("mực") ||
    n.includes("cá") ||
    n.includes("nghêu") ||
    n.includes("bạch tuộc") ||
    n.includes("sò") ||
    n.includes("ốc")
  ) {
    return "Hải sản";
  }

  return ing && ing.category ? ing.category : "Khác";
}

export function getCategoryBadgeClass(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("gia vị")) return "cat-badge cat-badge--gia-vi";
  if (cat.includes("rau")) return "cat-badge cat-badge--rau";
  if (cat.includes("bún")) return "cat-badge cat-badge--bun";
  if (cat.includes("thịt")) return "cat-badge cat-badge--thit";
  if (cat.includes("hải sản")) return "cat-badge cat-badge--hai-san";
  return "cat-badge cat-badge--khac";
}
