const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { parseValidId, validateDish } = require("../validation");

// 1. GET /api/dishes - Danh sách món ăn (có tìm kiếm q, category, status, sort)
router.get("/", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort.trim() : "";

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (status === "available") {
      where.available = true;
    } else if (status === "unavailable") {
      where.available = false;
    }

    let orderBy = { id: "asc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "name") {
      orderBy = { name: "asc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        chef: true,
        ingredients: true,
      },
      orderBy,
    });

    return res.status(200).json({
      ok: true,
      data: dishes,
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/dishes/:id - Xem chi tiết một món ăn
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseValidId(req.params.id);
    if (id === null) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy món ăn",
        },
      });
    }

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        chef: true,
        ingredients: true,
      },
    });

    if (!dish) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy món ăn",
        },
      });
    }

    return res.status(200).json({
      ok: true,
      data: dish,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/dishes - Thêm món ăn mới
router.post("/", async (req, res, next) => {
  try {
    const validation = validateDish(req.body, false);
    if (!validation.isValid) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Dữ liệu món ăn không hợp lệ",
          fields: validation.fields,
        },
      });
    }

    // Kiểm tra đầu bếp nếu có chọn
    if (validation.data.chefId) {
      const chefExists = await prisma.chef.findUnique({
        where: { id: validation.data.chefId },
      });
      if (!chefExists) {
        return res.status(200).json({
          ok: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Đầu bếp được chọn không tồn tại",
            fields: { chefId: "Vui lòng chọn đầu bếp hợp lệ" },
          },
        });
      }
    }

    // Kiểm tra nguyên liệu nếu có chọn
    if (validation.ingredientIds && validation.ingredientIds.length > 0) {
      const existingIngredients = await prisma.ingredient.findMany({
        where: { id: { in: validation.ingredientIds } },
        select: { id: true },
      });
      if (existingIngredients.length !== validation.ingredientIds.length) {
        return res.status(200).json({
          ok: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Một hoặc nhiều nguyên liệu không tồn tại",
            fields: { ingredientIds: "Vui lòng chọn nguyên liệu hợp lệ" },
          },
        });
      }
    }

    // Tạo bản ghi an toàn với các trường đã whitelist
    const createData = {
      name: validation.data.name,
      description: validation.data.description,
      price: validation.data.price,
      category: validation.data.category,
      available: validation.data.available,
      imageUrl: validation.data.imageUrl,
    };

    if (validation.data.chefId) {
      createData.chef = { connect: { id: validation.data.chefId } };
    }
    if (validation.ingredientIds && validation.ingredientIds.length > 0) {
      createData.ingredients = {
        connect: validation.ingredientIds.map((id) => ({ id })),
      };
    }

    const newDish = await prisma.dish.create({
      data: createData,
      include: {
        chef: true,
        ingredients: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: newDish,
    });
  } catch (error) {
    next(error);
  }
});

// 4. PATCH /api/dishes/:id - Chỉnh sửa một phần món ăn
router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseValidId(req.params.id);
    if (id === null) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy món ăn",
        },
      });
    }

    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy món ăn",
        },
      });
    }

    const validation = validateDish(req.body, true);
    if (!validation.isValid) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Dữ liệu món ăn không hợp lệ",
          fields: validation.fields,
        },
      });
    }

    // Kiểm tra đầu bếp nếu sửa chefId
    if (validation.data.chefId !== undefined) {
      if (validation.data.chefId !== null) {
        const chefExists = await prisma.chef.findUnique({
          where: { id: validation.data.chefId },
        });
        if (!chefExists) {
          return res.status(200).json({
            ok: false,
            error: {
              code: "VALIDATION_FAILED",
              message: "Đầu bếp được chọn không tồn tại",
              fields: { chefId: "Vui lòng chọn đầu bếp hợp lệ" },
            },
          });
        }
      }
    }

    // Kiểm tra nguyên liệu nếu sửa ingredientIds
    if (validation.ingredientIds !== undefined && validation.ingredientIds.length > 0) {
      const existingIngredients = await prisma.ingredient.findMany({
        where: { id: { in: validation.ingredientIds } },
        select: { id: true },
      });
      if (existingIngredients.length !== validation.ingredientIds.length) {
        return res.status(200).json({
          ok: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Một hoặc nhiều nguyên liệu không tồn tại",
            fields: { ingredientIds: "Vui lòng chọn nguyên liệu hợp lệ" },
          },
        });
      }
    }

    const updateData = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.price !== undefined) updateData.price = validation.data.price;
    if (validation.data.category !== undefined) updateData.category = validation.data.category;
    if (validation.data.available !== undefined) updateData.available = validation.data.available;
    if (validation.data.imageUrl !== undefined) updateData.imageUrl = validation.data.imageUrl;

    if (validation.data.chefId !== undefined) {
      if (validation.data.chefId === null) {
        updateData.chef = { disconnect: true };
      } else {
        updateData.chef = { connect: { id: validation.data.chefId } };
      }
    }

    if (validation.ingredientIds !== undefined) {
      updateData.ingredients = {
        set: validation.ingredientIds.map((ingId) => ({ id: ingId })),
      };
    }

    const updatedDish = await prisma.dish.update({
      where: { id },
      data: updateData,
      include: {
        chef: true,
        ingredients: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: updatedDish,
    });
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /api/dishes/:id - Xóa món ăn
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseValidId(req.params.id);
    if (id === null) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy món ăn",
        },
      });
    }

    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      return res.status(200).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Không tìm thấy món ăn",
        },
      });
    }

    await prisma.dish.delete({ where: { id } });

    return res.status(200).json({
      ok: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
