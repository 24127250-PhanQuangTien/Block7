import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { dishApi } from "../../../apiClient";
import { LoadingSpinner, NotFoundCard, ErrorAlert } from "../../../components/StateViews";

export default function DishDelete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await dishApi.getById(id);
        setDish(data);
      } catch (err) {
        if (err.code === "NOT_FOUND" || err.status === 404) {
          setNotFound(true);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await dishApi.delete(id);
      navigate("/admin/dishes");
    } catch (err) {
      setError(err);
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

  if (error && !dish) {
    return (
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <ErrorAlert error={error} onRetry={() => window.location.reload()} />
        </div>
      </section>
    );
  }

  if (!dish) return null;

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div className="confirm-card">
          <h1 className="confirm-title">Xác Nhận Xóa Món Ăn</h1>
          <p className="confirm-subtitle">
            Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn không?
          </p>

          {error && (
            <div style={{ marginBottom: "20px" }}>
              <ErrorAlert error={error} />
            </div>
          )}

          <div className="confirm-target-box">
            <div className="target-title">{dish.name}</div>
            <div className="target-meta">
              <span>Giá: {dish.price.toLocaleString("vi-VN")} VNĐ</span>
              <span>•</span>
              <span>Phân loại: {dish.category || "Món chung"}</span>
            </div>
            {dish.description && (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  marginTop: "10px",
                }}
              >
                "{dish.description}"
              </p>
            )}
          </div>

          <div className="confirm-warning-note">
            Lưu ý: Món ăn sau khi xóa sẽ không thể khôi phục lại.
          </div>

          <div className="confirm-actions">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="btn btn--primary"
              style={{ background: "var(--burgundy)", color: "#fff", width: "100%" }}
            >
              {submitting ? "Đang Xóa..." : "Xác Nhận Xóa Món"}
            </button>
            <Link
              to="/admin/dishes"
              className="btn btn--ghost"
              style={{ width: "100%", textAlign: "center" }}
            >
              Hủy Bỏ và Quay Lại
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
