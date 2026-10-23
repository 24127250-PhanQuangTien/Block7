import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { chefApi } from "../../../apiClient";
import { LoadingSpinner, NotFoundCard } from "../../../components/StateViews";

export default function ChefForm({ isEdit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchChef = async () => {
      setLoading(true);
      setGeneralError(null);
      try {
        const chef = await chefApi.getById(id);
        setFormData({
          name: chef.name || "",
          specialty: chef.specialty || "",
        });
      } catch (err) {
        if (err.code === "NOT_FOUND" || err.status === 404) {
          setNotFound(true);
        } else {
          setGeneralError(err.message || "Không thể tải thông tin đầu bếp.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChef();
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

    try {
      if (isEdit) {
        await chefApi.update(id, formData);
      } else {
        await chefApi.create(formData);
      }
      navigate("/admin/chefs");
    } catch (err) {
      if (err.type === "BUSINESS_ERROR" && err.code === "VALIDATION_FAILED") {
        setGeneralError(err.message || "Dữ liệu đầu bếp không hợp lệ.");
        setFieldErrors(err.fields || {});
      } else {
        setGeneralError(err.message || "Đã xảy ra sự cố khi lưu thông tin.");
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
            title="Không Tìm Thấy Đầu Bếp"
            message="Thông tin đầu bếp này không tồn tại trong danh sách."
            backUrl="/admin/chefs"
            backText="← Về Danh Sách Đầu Bếp"
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
              {isEdit ? "Chỉnh Sửa Hồ Sơ Đầu Bếp" : "Thêm Đầu Bếp Mới"}
            </h1>
            <p className="form-subtitle">
              {isEdit
                ? "Chỉnh sửa thông tin và sở trường của đầu bếp."
                : "Thêm thông tin đầu bếp vào đội ngũ nhà hàng."}
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
                Họ Và Tên Đầu Bếp:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                placeholder="Ví dụ: Nguyễn Văn Hải"
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

            <div className="form-group">
              <label htmlFor="specialty" className="form-label required">
                Sở Trường / Chuyên Môn Ẩm Thực:
              </label>
              <textarea
                id="specialty"
                name="specialty"
                className={`form-control ${fieldErrors.specialty ? "is-invalid" : ""}`}
                rows="3"
                placeholder="Ví dụ: Bếp trưởng món nướng than hoa, 15 năm kinh nghiệm ẩm thực truyền thống..."
                value={formData.specialty}
                onChange={handleChange}
                required
              ></textarea>
              {fieldErrors.specialty && (
                <div className="field-error">
                  {fieldErrors.specialty}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn--primary"
              >
                {submitting ? "Đang Lưu..." : "Lưu Đầu Bếp"}
              </button>
              <Link to="/admin/chefs" className="btn btn--ghost">
                Hủy Bỏ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
