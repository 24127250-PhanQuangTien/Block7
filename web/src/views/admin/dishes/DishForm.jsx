import { Check, CircleAlert, Plus, RotateCcw, Save, Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { dishApi, chefApi, ingredientApi } from "../../../apiClient";
import { LoadingSkeleton, NotFoundCard } from "../../../components/StateViews";
import ChefSelect from "../../../components/ChefSelect";
import { filterIngredientNames } from "../../../utils/search";
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

  // Lưu trữ số lượng và đơn vị của từng nguyên liệu được chọn
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [ingredientUnits, setIngredientUnits] = useState({});

  const [chefs, setChefs] = useState([]);
  const [chefsLoading, setChefsLoading] = useState(true);
  const [chefsError, setChefsError] = useState(null);
  const [chefLoadAttempt, setChefLoadAttempt] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notFound, setNotFound] = useState(false);

  // Trạng thái mở/đóng Popup chọn nguyên liệu + bộ lọc trong Popup
  const [ingPopupOpen, setIngPopupOpen] = useState(false);
  const [ingSearch, setIngSearch] = useState("");
  const [selectedIngTag, setSelectedIngTag] = useState("Tất cả");
  const [ingUnit, setIngUnit] = useState("");
  useEffect(() =>
  {
    let cancelled = false;
    setChefsLoading(true);
    setChefsError(null);
    chefApi.list().then((data) =>
    {
      if (!cancelled)
      {
        setChefs(data);
      }
    }).catch((error) =>
    {
      if (!cancelled)
      {
        setChefsError(error);
      }
    }).finally(() =>
    {
      if (!cancelled)
      {
        setChefsLoading(false);
      }
    });
    return () =>
    {
      cancelled = true;
    };
  }, [chefLoadAttempt]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setGeneralError(null);
      try {
        const loadedIngredients = await ingredientApi.list();
        setIngredients(loadedIngredients);

        if (isEdit) {
          const dish = await dishApi.getById(id);
          const initialQuantities = {};
          const initialUnits = {};
          if (dish.ingredients) {
            dish.ingredients.forEach((i) => {
              initialQuantities[i.id] = String(i.quantity !== undefined ? i.quantity : 1);
              initialUnits[i.id] = i.unit || "";
            });
          }
          setIngredientQuantities(initialQuantities);
          setIngredientUnits(initialUnits);

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

  // Đóng popup khi bấm phím Escape
  useEffect(() => {
    if (!ingPopupOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIngPopupOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ingPopupOpen]);

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

  const handleAddIngredient = (ingId) => {
    setFormData((prev) => {
      if (prev.ingredientIds.includes(ingId)) return prev;
      return { ...prev, ingredientIds: [...prev.ingredientIds, ingId] };
    });

    setIngredientQuantities((prev) => {
      const next = { ...prev };
      if (next[ingId] === undefined) {
        next[ingId] = "1";
      }
      return next;
    });

    setIngredientUnits((prev) => {
      const next = { ...prev };
      if (next[ingId] === undefined) {
        const found = ingredients.find((i) => i.id === ingId);
        next[ingId] = (found && found.unit) || "";
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

  const handleRemoveIngredient = (ingId) => {
    setFormData((prev) => ({
      ...prev,
      ingredientIds: prev.ingredientIds.filter((item) => item !== ingId),
    }));
  };

  const handleQuantityChange = (ingId, val) => {
    setIngredientQuantities((prev) => ({
      ...prev,
      [ingId]: val,
    }));
  };

  const handleUnitChange = (ingId, val) => {
    setIngredientUnits((prev) => ({
      ...prev,
      [ingId]: val,
    }));
  };

  // Danh sách nguyên liệu đã chọn (hiển thị ngay trong form)
  const selectedIngredientsList = formData.ingredientIds
    .map((ingId) => ingredients.find((i) => i.id === ingId))
    .filter(Boolean);

  // Danh sách nguyên liệu chưa chọn (hiển thị trong Popup để chọn thêm)
  const unselectedIngredients = ingredients.filter(
    (ing) => !formData.ingredientIds.includes(ing.id)
  );

  const getAvailableTagCount = (tag) => {
    if (tag === "Tất cả") return unselectedIngredients.length;
    return unselectedIngredients.filter(
      (i) => getIngredientCategory(i).toLowerCase() === tag.toLowerCase()
    ).length;
  };

  const filteredAvailableIngredients = filterIngredientNames(unselectedIngredients, {
    q: ingSearch,
    category: selectedIngTag,
    unit: ingUnit,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredErrors = {};
    if (!formData.chefId) requiredErrors.chefId = "Vui lòng chọn một đầu bếp.";
    if (formData.ingredientIds.length === 0) {
      requiredErrors.ingredientIds = "Vui lòng chọn ít nhất một nguyên liệu.";
    }
    if (Object.keys(requiredErrors).length > 0) {
      setFieldErrors(requiredErrors);
      return;
    }

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
      ingredientUnits,
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
          <LoadingSkeleton variant="form" />
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
            backText="Về Danh Sách Món Ăn"
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
                <strong><CircleAlert className="ui-icon" aria-hidden="true" /> Lỗi xác thực dữ liệu:</strong>
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
              <ChefSelect
                value={formData.chefId}
                chefs={chefs}
                loading={chefsLoading}
                error={chefsError}
                onRetry={() => setChefLoadAttempt((attempt) => attempt + 1)}
                onChange={(value) => handleChange({ target: { name: "chefId", value } })}
                invalid={Boolean(fieldErrors.chefId)}
                describedBy={`chef-help${fieldErrors.chefId ? " chef-error" : ""}`}
              />
              <small
                id="chef-help"
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
                <div id="chef-error" className="field-error">
                  {fieldErrors.chefId}
                </div>
              )}
            </div>

            {/* Chọn nguyên liệu bằng Popup + Danh sách nguyên liệu đã chọn trong Form */}
            <div className="form-group">
              <div className="ingredient-picker-toolbar">
                <label className="form-label required" style={{ margin: 0 }}>
                  Danh Sách Nguyên Liệu (Chọn và nhập số lượng):
                </label>
                <div className="ingredient-picker-toolbar__actions">
                  <span
                    className={`ingredient-selected-badge ${
                      formData.ingredientIds.length > 0 ? "has-items" : ""
                    }`}
                  >
                    Đã chọn: {formData.ingredientIds.length} nguyên liệu
                  </span>
                  <button
                    type="button"
                    className="btn btn--primary ingredient-open-popup-btn"
                    onClick={() => setIngPopupOpen(true)}
                  >
                    <Plus className="ui-icon" aria-hidden="true" /> Chọn thêm nguyên liệu
                  </button>
                </div>
              </div>

              {/* Khu vực hiển thị các nguyên liệu ĐÃ CHỌN ngay trong Form */}
              <div className="selected-ingredients-box">
                {selectedIngredientsList.length === 0 ? (
                  <div className="selected-ingredients-empty">
                    <p>Chưa có nguyên liệu nào được chọn cho món ăn này.</p>
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => setIngPopupOpen(true)}
                    >
                      <Plus className="ui-icon" aria-hidden="true" /> Mở danh sách chọn nguyên liệu
                    </button>
                  </div>
                ) : (
                  <div className="selected-ingredients-list">
                    {selectedIngredientsList.map((ing) => {
                      const ingCategory = getIngredientCategory(ing);
                      return (
                        <div key={ing.id} className="selected-ingredient-row">
                          <div className="selected-ingredient-info">
                            <span className="ingredient-name" title={ing.name}>
                              <strong>{ing.name}</strong>
                            </span>
                            <span className={getCategoryBadgeClass(ingCategory)}>
                              {ingCategory}
                            </span>
                          </div>

                          <div className="selected-ingredient-controls">
                            <div className="selected-ingredient-field">
                              <label htmlFor={`ingredient-quantity-${ing.id}`}>Số lượng:</label>
                              <input
                                id={`ingredient-quantity-${ing.id}`}
                                aria-label={`Số lượng ${ing.name}`}
                                type="text"
                                inputMode="numeric"
                                value={
                                  ingredientQuantities[ing.id] !== undefined
                                    ? ingredientQuantities[ing.id]
                                    : "1"
                                }
                                onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
                                className="ingredient-qty-input"
                                placeholder="1"
                              />
                            </div>

                            <div className="selected-ingredient-field">
                              <label htmlFor={`ingredient-unit-${ing.id}`}>Đơn vị:</label>
                              <input
                                id={`ingredient-unit-${ing.id}`}
                                aria-label={`Đơn vị ${ing.name}`}
                                type="text"
                                value={
                                  ingredientUnits[ing.id] !== undefined
                                    ? ingredientUnits[ing.id]
                                    : ing.unit || ""
                                }
                                onChange={(e) => handleUnitChange(ing.id, e.target.value)}
                                className="ingredient-unit-input"
                                placeholder="Đơn vị"
                                title="Tùy chỉnh đơn vị cho món ăn (ví dụ: gam, thìa, bó...)"
                              />
                            </div>

                            <button
                              type="button"
                              className="ingredient-remove-btn"
                              onClick={() => handleRemoveIngredient(ing.id)}
                              title="Xóa nguyên liệu này và trả về danh sách chọn"
                              aria-label={`Bỏ chọn ${ing.name}`}
                            >
                              <X className="ui-icon" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* POPUP CHỌN NGUYÊN LIỆU */}
              {ingPopupOpen && (
                <div
                  className="ingredient-modal-backdrop"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ingredient-modal-title"
                  onKeyDown={(event) =>
                  {
                    if (event.key === "Enter" && event.target.tagName === "INPUT") event.preventDefault();
                  }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setIngPopupOpen(false);
                  }}
                >
                  <div className="ingredient-modal-panel">
                    <div className="ingredient-modal-header">
                      <div>
                        <h3 id="ingredient-modal-title" className="ingredient-modal-title">
                          Chọn Nguyên Liệu Cho Món Ăn
                        </h3>
                        <p className="ingredient-modal-subtitle">
                          Bấm vào nguyên liệu để thêm ngay vào biểu mẫu ({unselectedIngredients.length} nguyên liệu có sẵn)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ingredient-modal-close"
                        onClick={() => setIngPopupOpen(false)}
                        aria-label="Đóng bảng chọn nguyên liệu"
                      >
                        <X className="ui-icon" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="ingredient-modal-filters">
                      <div className="ingredient-search-wrapper">
                        <span className="ingredient-search-icon" aria-hidden="true">
                          <Search className="ui-icon" aria-hidden="true" />
                        </span>
                        <input
                          type="text"
                          value={ingSearch}
                          onChange={(e) => setIngSearch(e.target.value)}
                          placeholder="Nhập tên nguyên liệu..."
                          aria-label="Tìm nhanh nguyên liệu"
                          className="ingredient-search-input"
                        />
                        {ingSearch && (
                          <button
                            type="button"
                            className="ingredient-search-clear"
                            onClick={() => setIngSearch("")}
                            title="Xóa tìm kiếm"
                            aria-label="Xóa tìm kiếm nguyên liệu"
                          >
                            <X className="ui-icon" aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      <div className="dish-form-field">
                        <label htmlFor="ingredient-search-unit">Đơn vị tính</label>
                        <input
                          id="ingredient-search-unit"
                          value={ingUnit}
                          onChange={(event) => setIngUnit(event.target.value)}
                          placeholder="Ví dụ: kg, gam, bó"
                        />
                      </div>

                      <div className="ingredient-tags-container">
                        {INGREDIENT_TAGS.map((tag) => {
                          const count = getAvailableTagCount(tag);
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
                      </div>
                    </div>

                    <div className="ingredient-modal-body">
                      {filteredAvailableIngredients.length > 0 ? (
                        <div className="ingredient-popup-grid">
                          {filteredAvailableIngredients.map((ing) => {
                            const ingCategory = getIngredientCategory(ing);
                            return (
                              <button
                                key={ing.id}
                                type="button"
                                className="ingredient-popup-item"
                                onClick={() => handleAddIngredient(ing.id)}
                                title={`Chọn ${ing.name}`}
                              >
                                <span className="ingredient-popup-item__left">
                                  <Plus className="ui-icon ingredient-popup-item__icon" aria-hidden="true" />
                                  <span className="ingredient-name">
                                    <strong>{ing.name}</strong>
                                  </span>
                                </span>
                                <span className="ingredient-popup-item__right">
                                  {ing.unit && (
                                    <span className="ingredient-popup-item__unit">({ing.unit})</span>
                                  )}
                                  <span className={getCategoryBadgeClass(ingCategory)}>
                                    {ingCategory}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="ingredient-modal-empty">
                          {unselectedIngredients.length === 0 ? (
                            <p>Tất cả nguyên liệu đã được thêm vào món ăn!</p>
                          ) : (
                            <>
                              <p>Không có nguyên liệu nào phù hợp với bộ lọc hiện tại.</p>
                              {(ingSearch || ingUnit || selectedIngTag !== "Tất cả") && (
                                <button
                                  type="button"
                                  className="btn btn--outline"
                                  onClick={() => {
                                    setIngSearch("");
                                    setIngUnit("");
                                    setSelectedIngTag("Tất cả");
                                  }}
                                >
                                  <RotateCcw className="ui-icon" aria-hidden="true" /> Đặt lại tìm kiếm & tag
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ingredient-modal-footer">
                      <span className="ingredient-modal-footer__status">
                        <Check className="ui-icon" aria-hidden="true" /> Đã chọn{" "}
                        <strong>{formData.ingredientIds.length}</strong> nguyên liệu trong biểu mẫu
                      </span>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setIngPopupOpen(false)}
                      >
                        Xong ({formData.ingredientIds.length})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <small
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  marginTop: "6px",
                  display: "block",
                }}
              >
                Bấm &ldquo;Chọn thêm nguyên liệu&rdquo; để mở danh sách chọn, sau đó điều chỉnh số lượng hoặc bấm dấu X để bỏ nguyên liệu.
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
                Liên kết ảnh món ăn:
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                className="form-control"
                placeholder="Dán liên kết ảnh món ăn..."
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
                  Món ăn đang sẵn sàng phục vụ thực khách
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
                <Save className="ui-icon" aria-hidden="true" /> {submitting ? "Đang Lưu..." : isEdit ? "Lưu Thay Đổi" : "Lưu Món Ăn"}
              </button>
              <Link to="/admin/dishes" className="btn btn--ghost">
                <X className="ui-icon" aria-hidden="true" /> Hủy Bỏ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
