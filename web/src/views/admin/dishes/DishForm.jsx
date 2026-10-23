import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { dishApi, chefApi, ingredientApi } from "../../../apiClient";
import { LoadingSpinner, NotFoundCard } from "../../../components/StateViews";
import {
  INGREDIENT_TAGS,
  getIngredientCategory,
  getCategoryBadgeClass,
} from "../../../utils/ingredientUtils";

export default function DishForm({ isEdit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    chefId: "",
    ingredientIds: [],
    imageUrl: "",
    description: "",
    available: true,
  });

  // Lưu trữ số lượng của từng nguyên liệu được chọn
  const [ingredientQuantities, setIngredientQuantities] = useState({});

  const [chefs, setChefs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notFound, setNotFound] = useState(false);

  // Bộ lọc và tìm kiếm nhanh nguyên liệu
  const [ingSearch, setIngSearch] = useState("");
  const [selectedIngTag, setSelectedIngTag] = useState("Tất cả");

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setGeneralError(null);
      try {
        const [loadedChefs, loadedIngredients] = await Promise.all([
          chefApi.list(),
          ingredientApi.list(),
        ]);
        setChefs(loadedChefs);
        setIngredients(loadedIngredients);

        if (isEdit) {
          const dish = await dishApi.getById(id);
          const initialQuantities = {};
          if (dish.ingredients) {
            dish.ingredients.forEach((i) => {
              initialQuantities[i.id] = i.quantity || 1;
            });
          }
          setIngredientQuantities(initialQuantities);

          setFormData({
            name: dish.name || "",
            price: dish.price !== undefined ? dish.price : "",
            category: dish.category || "",
            chefId: dish.chefId ? String(dish.chefId) : "",
            ingredientIds: dish.ingredients ? dish.ingredients.map((i) => i.id) : [],
            imageUrl: dish.imageUrl || "",
            description: dish.description || "",
            available: dish.available !== false,
          });
        }
      } catch (err) {
        if (isEdit && (err.code === "NOT_FOUND" || err.status === 404)) {
          setNotFound(true);
        } else {
          setGeneralError(err.message || "Không thể tải dữ liệu khởi tạo biểu mẫu.");
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleIngredientToggle = (ingId) => {
    setFormData((prev) => {
      const exists = prev.ingredientIds.includes(ingId);
      const nextIds = exists
        ? prev.ingredientIds.filter((item) => item !== ingId)
        : [...prev.ingredientIds, ingId];
      return { ...prev, ingredientIds: nextIds };
    });

    setIngredientQuantities((prev) => {
      const next = { ...prev };
      if (!next[ingId]) {
        next[ingId] = 1;
      }
      return next;
    });

    if (fieldErrors.ingredientIds) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.ingredientIds;
        return next;
      });
    }
  };

  const handleQuantityChange = (ingId, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setIngredientQuantities((prev) => ({
      ...prev,
      [ingId]: num,
    }));
  };

  const getTagCount = (tag) => {
    if (tag === "Tất cả") return ingredients.length;
    if (tag === "Đã chọn") return formData.ingredientIds.length;
    return ingredients.filter(
      (i) => getIngredientCategory(i).toLowerCase() === tag.toLowerCase()
    ).length;
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const ingCat = getIngredientCategory(ing);
    const matchesTag =
      selectedIngTag === "Tất cả"
        ? true
        : selectedIngTag === "Đã chọn"
        ? formData.ingredientIds.includes(ing.id)
        : ingCat.toLowerCase() === selectedIngTag.toLowerCase();

    const q = ingSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (ing.name && ing.name.toLowerCase().includes(q)) ||
      (ing.unit && ing.unit.toLowerCase().includes(q)) ||
      ingCat.toLowerCase().includes(q);

    return matchesTag && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneralError(null);
    setFieldErrors({});

    const payload = {
      name: formData.name,
      price: formData.price !== "" ? Number(formData.price) : "",
      category: formData.category,
      chefId: formData.chefId ? Number(formData.chefId) : null,
      ingredientIds: formData.ingredientIds,
      ingredientQuantities,
      imageUrl: formData.imageUrl,
      description: formData.description,
      available: formData.available,
    };

    try {
      if (isEdit) {
        await dishApi.update(id, payload);
      } else {
        await dishApi.create(payload);
      }
      navigate("/admin/dishes");
    } catch (err) {
      if (err.type === "BUSINESS_ERROR" && err.code === "VALIDATION_FAILED") {
        setGeneralError(err.message || "Thông tin món ăn chưa hợp lệ. Vui lòng kiểm tra lại.");
        setFieldErrors(err.fields || {});
      } else {
        setGeneralError(err.message || "Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="section" style={{ paddingTop: "120px" }}>
        <div className="container">
          <NotFoundCard
            title="Không Tìm Thấy Món Ăn"
            message="Món ăn này không tồn tại hoặc đã bị gỡ khỏi thực đơn."
            backUrl="/admin/dishes"
            backText="← Về Danh Sách Món Ăn"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">
              {isEdit ? "Chỉnh Sửa Món Ăn" : "Thêm Món Ăn Mới"}
            </h1>
            <p className="form-subtitle">
              {isEdit
                ? "Cập nhật thông tin và hình ảnh của món ăn."
                : "Điền thông tin để thêm món mới vào thực đơn nhà hàng."}
            </p>
          </div>

          {generalError && (
            <div
              className="alert alert-danger"
              role="alert"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "var(--radius-sm)",
                padding: "16px 20px",
                marginBottom: "24px",
                color: "#7F1D1D",
              }}
            >
              <div className="alert-content">
                <strong>Lỗi xác thực dữ liệu:</strong>
                <p style={{ margin: "4px 0 0" }}>{generalError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="standard-form">
            {/* Tên món ăn */}
            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Tên Món Ăn:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                placeholder="Ví dụ: Phở Bò Tái Nạm"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && (
                <div className="field-error">
                  {fieldErrors.name}
                </div>
              )}
            </div>

            <div className="form-row">
              {/* Đơn giá */}
              <div className="form-group">
                <label htmlFor="price" className="form-label required">
                  Đơn Giá (VNĐ):
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className={`form-control ${fieldErrors.price ? "is-invalid" : ""}`}
                  placeholder="Ví dụ: 55000"
                  min="0"
                  max="2147483647"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.price && (
                  <div className="field-error">
                    {fieldErrors.price}
                  </div>
                )}
              </div>

              {/* Phân loại */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Phân Loại Món:
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className={`form-control ${fieldErrors.category ? "is-invalid" : ""}`}
                  placeholder="Ví dụ: Món Nước, Món Khô..."
                  value={formData.category}
                  onChange={handleChange}
                />
                {fieldErrors.category && (
                  <div className="field-error">
                    {fieldErrors.category}
                  </div>
                )}
              </div>
            </div>

            {/* Chọn đầu bếp */}
            <div className="form-group">
              <label htmlFor="chefId" className="form-label required">
                Đầu Bếp Phụ Trách:
              </label>
              <select
                id="chefId"
                name="chefId"
                className={`form-control ${fieldErrors.chefId ? "is-invalid" : ""}`}
                value={formData.chefId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn đầu bếp phụ trách món ăn --</option>
                {chefs.map((chef) => (
                  <option key={chef.id} value={chef.id}>
                    {chef.name} — {chef.specialty || "Đầu bếp"}
                  </option>
                ))}
              </select>
              <small
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Mỗi món ăn bắt buộc phải có một đầu bếp đảm nhiệm chế biến.
              </small>
              {fieldErrors.chefId && (
                <div className="field-error">
                  {fieldErrors.chefId}
                </div>
              )}
            </div>

            {/* Chọn danh sách nguyên liệu kèm thanh tìm kiếm và lọc theo tag */}
            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <label className="form-label required" style={{ margin: 0 }}>
                  Danh Sách Nguyên Liệu (Chọn và nhập số lượng):
                </label>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: formData.ingredientIds.length > 0 ? "var(--burgundy)" : "var(--text-muted)",
                    background: formData.ingredientIds.length > 0 ? "#FEE2E2" : "#F5F5F4",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    border: formData.ingredientIds.length > 0 ? "1px solid #FECDD3" : "1px solid #E7E5E4",
                  }}
                >
                  Đã chọn: {formData.ingredientIds.length} nguyên liệu
                </span>
              </div>

              {/* Thanh tìm kiếm nhỏ và các tag lọc (gia vị, rau, bún, thịt,...) */}
              <div className="ingredient-filter-box">
                <div className="ingredient-search-wrapper">
                  <span className="ingredient-search-icon">🔍</span>
                  <input
                    type="text"
                    value={ingSearch}
                    onChange={(e) => setIngSearch(e.target.value)}
                    placeholder="Tìm nhanh nguyên liệu theo tên, đơn vị tính..."
                    className="ingredient-search-input"
                  />
                  {ingSearch && (
                    <button
                      type="button"
                      className="ingredient-search-clear"
                      onClick={() => setIngSearch("")}
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Các tag lọc */}
                <div className="ingredient-tags-container">
                  {INGREDIENT_TAGS.map((tag) => {
                    const count = getTagCount(tag);
                    const isActive = selectedIngTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`ingredient-tag-btn ${isActive ? "active" : ""}`}
                        onClick={() => setSelectedIngTag(tag)}
                      >
                        <span>{tag}</span>
                        <span className="tag-count">{count}</span>
                      </button>
                    );
                  })}
                  {formData.ingredientIds.length > 0 && (
                    <button
                      type="button"
                      className={`ingredient-tag-btn ${selectedIngTag === "Đã chọn" ? "active" : ""}`}
                      onClick={() =>
                        setSelectedIngTag(selectedIngTag === "Đã chọn" ? "Tất cả" : "Đã chọn")
                      }
                      style={{
                        borderColor: selectedIngTag === "Đã chọn" ? "var(--burgundy)" : "#FCA5A5",
                        color: selectedIngTag === "Đã chọn" ? "#fff" : "#991B1B",
                        backgroundColor:
                          selectedIngTag === "Đã chọn" ? "var(--burgundy)" : "#FEF2F2",
                      }}
                    >
                      <span>✓ Đã chọn</span>
                      <span className="tag-count">{formData.ingredientIds.length}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lưới hiển thị danh sách nguyên liệu */}
              <div
                className="ingredients-checkbox-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                  gap: "10px",
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "12px",
                  background: "var(--cream)",
                  border: "2px solid #E7E5E4",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {filteredIngredients.length > 0 ? (
                  filteredIngredients.map((ing) => {
                    const isChecked = formData.ingredientIds.includes(ing.id);
                    const ingCategory = getIngredientCategory(ing);
                    return (
                      <div
                        key={ing.id}
                        className={`ingredient-select-card ${isChecked ? "selected" : ""}`}
                      >
                        <label className="ingredient-select-header">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleIngredientToggle(ing.id)}
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "var(--burgundy)",
                              margin: 0,
                              cursor: "pointer",
                            }}
                          />
                          <span
                            style={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.88rem",
                            }}
                            title={ing.name}
                          >
                            <strong>{ing.name}</strong>
                          </span>
                          <span
                            className={getCategoryBadgeClass(ingCategory)}
                            style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                          >
                            {ingCategory}
                          </span>
                        </label>

                        {/* Ô nhập số lượng khi đã chọn nguyên liệu */}
                        {isChecked && (
                          <div className="ingredient-qty-box">
                            <label>Số lượng:</label>
                            <input
                              type="number"
                              min="1"
                              value={ingredientQuantities[ing.id] || 1}
                              onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
                              className="ingredient-qty-input"
                            />
                            <span className="ingredient-qty-unit">{ing.unit}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "24px 12px",
                      color: "var(--text-muted)",
                      fontSize: "0.88rem",
                    }}
                  >
                    <p style={{ margin: "0 0 10px 0" }}>
                      Không có nguyên liệu nào phù hợp với bộ lọc hiện tại.
                    </p>
                    {(ingSearch || selectedIngTag !== "Tất cả") && (
                      <button
                        type="button"
                        onClick={() => {
                          setIngSearch("");
                          setSelectedIngTag("Tất cả");
                        }}
                        style={{
                          background: "#fff",
                          border: "1px solid #D6D3D1",
                          borderRadius: "4px",
                          padding: "5px 12px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          color: "var(--charcoal)",
                          fontWeight: "600",
                        }}
                      >
                        ✕ Đặt lại tìm kiếm & tag
                      </button>
                    )}
                  </div>
                )}
              </div>
              <small
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                Tích chọn nguyên liệu và điền số lượng cần cho món ăn.
              </small>
              {fieldErrors.ingredientIds && (
                <div className="field-error">
                  {fieldErrors.ingredientIds}
                </div>
              )}
            </div>

            {/* Đường dẫn hình ảnh */}
            <div className="form-group">
              <label htmlFor="imageUrl" className="form-label">
                Đường Dẫn Hình Ảnh (URL hoặc /assets/img/dishes/...):
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                className="form-control"
                placeholder="Ví dụ: /assets/img/dishes/pho-bo.jpg hoặc https://..."
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            {/* Mô tả hương vị */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Mô Tả Hương Vị:
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="3"
                placeholder="Mô tả nguyên liệu, hương vị đặc trưng của món ăn..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Trạng thái phục vụ */}
            <div className="form-group">
              <label
                className="custom-checkbox"
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "var(--burgundy)" }}
                />
                <span style={{ fontSize: "0.95rem", color: "var(--charcoal)", fontWeight: 500 }}>
                  Món ăn đang sẵn sàng phục vụ thực khách (Available)
                </span>
              </label>
            </div>

            {/* Các nút hành động */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn--primary"
              >
                {submitting ? "Đang Lưu..." : isEdit ? "Lưu Thay Đổi" : "Lưu Món Ăn"}
              </button>
              <Link to="/admin/dishes" className="btn btn--ghost">
                Hủy Bỏ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
