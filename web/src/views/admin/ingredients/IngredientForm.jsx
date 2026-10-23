import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ingredientApi } from "../../../apiClient";
import { LoadingSpinner, NotFoundCard } from "../../../components/StateViews";
import SelectField from "../../../components/SelectField";

const categoryDescriptions = {
  "Gia vị": "Hành, tỏi, ớt, mắm, muối, tiêu, dầu ăn...",
  "Rau": "Rau thơm, rau củ quả, nấm tươi/khô...",
  "Bún": "Bún, phở, mì, miến, hủ tiếu, bột...",
  "Thịt": "Thịt bò, thịt heo, thịt gà, sườn, giò...",
  "Hải sản": "Tôm, cua, mực, cá, nghêu...",
  "Khác": "Các nguyên liệu thuộc nhóm khác.",
};

export default function IngredientForm({ isEdit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    quantity: "0",
    unit: "",
    category: "Gia vị",
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchIngredient = async () => {
      setLoading(true);
      setGeneralError(null);
      try {
        const item = await ingredientApi.getById(id);
        setFormData({
          name: item.name || "",
          quantity: item.quantity !== undefined ? String(item.quantity) : "0",
          unit: item.unit || "",
          category: item.category || "Gia vị",
        });
      } catch (err) {
        if (err.code === "NOT_FOUND" || err.status === 404) {
          setNotFound(true);
        } else {
          setGeneralError(err.message || "Không thể tải thông tin nguyên liệu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIngredient();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneralError(null);
    setFieldErrors({});

    const payload = {
      name: formData.name,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      category: formData.category,
    };

    try {
      if (isEdit) {
        await ingredientApi.update(id, payload);
      } else {
        await ingredientApi.create(payload);
      }
      navigate("/admin/ingredients");
    } catch (err) {
      if (err.type === "BUSINESS_ERROR" && err.code === "VALIDATION_FAILED") {
        setGeneralError(err.message || "Thông tin nguyên liệu chưa hợp lệ. Vui lòng kiểm tra lại.");
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
            title="Không Tìm Thấy Nguyên Liệu"
            message="Thông tin nguyên liệu này không tồn tại trong danh mục."
            backUrl="/admin/ingredients"
            backText="← Về Danh Sách Nguyên Liệu"
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
              {isEdit ? "Chỉnh Sửa Nguyên Liệu" : "Thêm Nguyên Liệu Mới"}
            </h1>
            <p className="form-subtitle">
              {isEdit
                ? "Chỉnh sửa thông tin và số lượng nguyên liệu trong kho."
                : "Thêm nguyên liệu mới vào danh mục kho bếp."}
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
            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Tên Nguyên Liệu:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                placeholder="Ví dụ: Bánh Phở Tươi, Thịt Bò File..."
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
              <div className="form-group">
                <label htmlFor="quantity" className="form-label required">
                  Số Lượng Tồn Kho:
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className={`form-control ${fieldErrors.quantity ? "is-invalid" : ""}`}
                  placeholder="0"
                  min="0"
                  max="2147483647"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.quantity && (
                  <div className="field-error">
                    {fieldErrors.quantity}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="unit" className="form-label required">
                  Đơn Vị Tính:
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  className={`form-control ${fieldErrors.unit ? "is-invalid" : ""}`}
                  placeholder="Ví dụ: kg, gam, bó, quả, lít..."
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.unit && (
                  <div className="field-error">
                    {fieldErrors.unit}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label id="category-label" htmlFor="category" className="form-label">
                Phân Loại (Tag Nhóm Nguyên Liệu):
              </label>
              <SelectField
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={(value) => handleChange({ target: { name: "category", value } })}
                labelledBy="category-label"
                describedBy="ingredient-category-help"
                options={Object.keys(categoryDescriptions).map((category) => ({ value: category, label: category }))}
              />
              <small id="ingredient-category-help" className="select-help">
                {categoryDescriptions[formData.category]}
              </small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn--primary"
              >
                {submitting ? "Đang Lưu..." : "Lưu Nguyên Liệu"}
              </button>
              <Link to="/admin/ingredients" className="btn btn--ghost">
                Hủy Bỏ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
