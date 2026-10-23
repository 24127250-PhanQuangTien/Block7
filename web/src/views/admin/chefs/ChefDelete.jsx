import { ArrowLeft, Trash2, TriangleAlert } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { chefApi } from "../../../apiClient";
import { LoadingSpinner, NotFoundCard, ErrorAlert } from "../../../components/StateViews";

export default function ChefDelete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchChef = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await chefApi.getById(id);
        setChef(data);
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

    fetchChef();
  }, [id]);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await chefApi.delete(id);
      navigate("/admin/chefs");
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
            title="Không Tìm Thấy Đầu Bếp"
            message="Thông tin đầu bếp này không tồn tại trong danh sách."
            backUrl="/admin/chefs"
            backText="Về Danh Sách Đầu Bếp"
          />
        </div>
      </section>
    );
  }

  if (error && !chef) {
    return (
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <ErrorAlert error={error} onRetry={() => window.location.reload()} />
        </div>
      </section>
    );
  }

  if (!chef) return null;

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div className="confirm-card">
          <h1 className="confirm-title">Xác Nhận Xóa Đầu Bếp</h1>
          <p className="confirm-subtitle">
            Bạn có chắc chắn muốn xóa đầu bếp này khỏi danh sách không?
          </p>

          {error && (
            <div style={{ marginBottom: "20px" }}>
              <ErrorAlert error={error} />
            </div>
          )}

          <div className="confirm-target-box">
            <div className="target-title">{chef.name}</div>
            <div className="target-meta">
              <span>Sở trường: {chef.specialty}</span>
            </div>
          </div>

          <div className="confirm-warning-note">
            <TriangleAlert className="ui-icon" aria-hidden="true" /> Lưu ý: Thông tin đầu bếp sau khi xóa sẽ không thể khôi phục lại.
          </div>

          <div className="confirm-actions">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="btn btn--primary"
              style={{ background: "var(--burgundy)", color: "#fff", width: "100%" }}
            >
              <Trash2 className="ui-icon" aria-hidden="true" /> {submitting ? "Đang Xóa..." : "Xác Nhận Xóa"}
            </button>
            <Link
              to="/admin/chefs"
              className="btn btn--ghost"
              style={{ width: "100%", textAlign: "center" }}
            >
              <ArrowLeft className="ui-icon" aria-hidden="true" /> Hủy Bỏ và Quay Lại
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
