const INT_MAX = 2147483647;

// Kiểm tra và ép kiểu số nguyên an toàn
function parseInteger(value, min = 0) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isInteger(value) && value >= min && value <= INT_MAX ? value : null;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text.length || /[^0-9]/.test(text)) return null;
  const num = Number(text);
  return Number.isInteger(num) && num >= min && num <= INT_MAX ? num : null;
}

// Kiểm tra ID nguyên dương hợp lệ (>= 1)
function parseValidId(value) {
  return parseInteger(value, 1);
}

// Validate Chef
// isPatch = true: chỉ validate các trường xuất hiện trong body
function validateChef(body, isPatch = false) {
  const fields = {};
  const data = {};

  if (!isPatch || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      fields.name = "Tên đầu bếp không được để trống";
    } else {
      data.name = body.name.trim();
    }
  }

  if (!isPatch || body.specialty !== undefined) {
    if (typeof body.specialty !== "string" || !body.specialty.trim()) {
      fields.specialty = "Sở trường của đầu bếp không được để trống";
    } else {
      data.specialty = body.specialty.trim();
    }
  }

  const hasErrors = Object.keys(fields).length > 0;
  return {
    isValid: !hasErrors,
    fields,
    data,
  };
}

// Validate Ingredient
function validateIngredient(body, isPatch = false) {
  const fields = {};
  const data = {};

  if (!isPatch || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      fields.name = "Tên nguyên liệu không được để trống";
    } else {
      data.name = body.name.trim();
    }
  }

  if (!isPatch || body.unit !== undefined) {
    if (typeof body.unit !== "string" || !body.unit.trim()) {
      fields.unit = "Đơn vị tính không được để trống";
    } else {
      data.unit = body.unit.trim();
    }
  }

  if (!isPatch || body.quantity !== undefined) {
    const qVal = body.quantity !== undefined ? body.quantity : 0;
    const qty = parseInteger(qVal, 0);
    if (qty === null) {
      fields.quantity = `Số lượng phải là số nguyên từ 0 đến ${INT_MAX}`;
    } else {
      data.quantity = qty;
    }
  }

  if (body.category !== undefined) {
    data.category = typeof body.category === "string" ? body.category.trim() || null : null;
  }

  const hasErrors = Object.keys(fields).length > 0;
  return {
    isValid: !hasErrors,
    fields,
    data,
  };
}

// Validate Dish
function validateDish(body, isPatch = false) {
  const fields = {};
  const data = {};

  if (!isPatch || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      fields.name = "Tên món ăn không được để trống";
    } else {
      data.name = body.name.trim();
    }
  }

  if (!isPatch || body.price !== undefined) {
    const price = parseInteger(body.price, 1);
    if (price === null) {
      fields.price = "Giá món ăn phải là số nguyên dương lớn hơn 0";
    } else {
      data.price = price;
    }
  }

  if (body.description !== undefined) {
    data.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }

  if (body.category !== undefined) {
    data.category = typeof body.category === "string" ? body.category.trim() || null : null;
  }

  if (body.available !== undefined) {
    data.available = Boolean(body.available);
  } else if (!isPatch) {
    data.available = true;
  }

  if (body.imageUrl !== undefined) {
    data.imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;
  }

  if (body.chefId !== undefined) {
    if (body.chefId === null || body.chefId === "") {
      data.chefId = null;
    } else {
      const chefId = parseValidId(body.chefId);
      if (chefId === null) {
        fields.chefId = "ID đầu bếp không hợp lệ";
      } else {
        data.chefId = chefId;
      }
    }
  }

  let ingredientIds = undefined;
  if (body.ingredientIds !== undefined) {
    if (!Array.isArray(body.ingredientIds)) {
      fields.ingredientIds = "Danh sách nguyên liệu phải là một mảng ID";
    } else {
      const parsed = body.ingredientIds.map(parseValidId);
      if (parsed.some((id) => id === null)) {
        fields.ingredientIds = "Một hoặc nhiều ID nguyên liệu không hợp lệ";
      } else {
        ingredientIds = [...new Set(parsed)];
      }
    }
  }

  const hasErrors = Object.keys(fields).length > 0;
  return {
    isValid: !hasErrors,
    fields,
    data,
    ingredientIds,
  };
}

module.exports = {
  INT_MAX,
  parseInteger,
  parseValidId,
  validateChef,
  validateIngredient,
  validateDish,
};
