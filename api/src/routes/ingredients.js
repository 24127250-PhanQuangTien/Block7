const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { parseValidId, validateIngredient } = require("../validation");

// 1. GET /api/ingredients - Danh sách nguyên liệu (có tìm kiếm q và lọc category)
router.get("/", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";

    const conditions = [];

    if (q) {
      conditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { unit: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (category && category.toLowerCase() !== "tất cả" && category.toLowerCase() !== "all") {
      conditions.push({
        category: { equals: category, mode: "insensitive" },
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const ingredients = await prisma.ingredient.findMany({
      where,
      include: {
        _count: { select: { dishes: true } },
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      ok: true,
      data: ingredients,
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/ingredients/:id - Chi tiết một nguyên liệu
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseValidId(req.params.id);
    if (id === null) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy nguyên liệu",
        },
      });
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        dishes: {
          select: { id: true, name: true, price: true, category: true, available: true },
        },
      },
    });

    if (!ingredient) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy nguyên liệu",
        },
      });
    }

    return res.status(200).json({
      ok: true,
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/ingredients - Thêm nguyên liệu mới
router.post("/", async (req, res, next) => {
  try {
    const validation = validateIngredient(req.body, false);
    if (!validation.isValid) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Dữ liệu nguyên liệu không hợp lệ",
          fields: validation.fields,
        },
      });
    }

    const newIngredient = await prisma.ingredient.create({
      data: {
        name: validation.data.name,
        quantity: validation.data.quantity,
        unit: validation.data.unit,
        category: validation.data.category || "Khác",
      },
    });

    return res.status(200).json({
      ok: true,
      data: newIngredient,
    });
  } catch (error) {
    next(error);
  }
});

// 4. PATCH /api/ingredients/:id - Sửa thông tin nguyên liệu
router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseValidId(req.params.id);
    if (id === null) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy nguyên liệu",
        },
      });
    }

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy nguyên liệu",
        },
      });
    }

    const validation = validateIngredient(req.body, true);
    if (!validation.isValid) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Dữ liệu nguyên liệu không hợp lệ",
          fields: validation.fields,
        },
      });
    }

    const updateData = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.unit !== undefined) updateData.unit = validation.data.unit;
    if (validation.data.quantity !== undefined) updateData.quantity = validation.data.quantity;
    if (validation.data.category !== undefined) updateData.category = validation.data.category;

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      ok: true,
      data: updatedIngredient,
    });
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /api/ingredients/:id - Xóa nguyên liệu
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseValidId(req.params.id);
    if (id === null) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy nguyên liệu",
        },
      });
    }

    const existing = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        dishes: {
          select: { id: true, name: true, category: true, imageUrl: true },
          orderBy: { name: "asc" },
        },
      },
    });
    if (!existing) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy nguyên liệu",
        },
      });
    }

    if (existing.dishes && existing.dishes.length > 0) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Không thể xóa nguyên liệu đang được món ăn sử dụng. Vui lòng gỡ nguyên liệu khỏi các món ăn trước.",
        },
      });
    }

    await prisma.ingredient.delete({ where: { id } });

    return res.status(200).json({
      ok: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
