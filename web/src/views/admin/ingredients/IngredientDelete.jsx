import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ingredientApi } from "../../../apiClient";
import { LoadingSpinner, NotFoundCard, ErrorAlert } from "../../../components/StateViews";

export default function IngredientDelete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchIngredient = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await ingredientApi.getById(id);
        setIngredient(data);
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

    fetchIngredient();
  }, [id]);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await ingredientApi.delete(id);
      navigate("/admin/ingredients");
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
            title="Không Tìm Thấy Nguyên Liệu"
            message="Thông tin nguyên liệu này không tồn tại trong danh mục."
            backUrl="/admin/ingredients"
            backText="← Về Danh Sách Nguyên Liệu"
          />
        </div>
      </section>
    );
  }

  if (error && !ingredient) {
    return (
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <ErrorAlert error={error} onRetry={() => window.location.reload()} />
        </div>
      </section>
    );
  }

  if (!ingredient) return null;

  const hasDishes = ingredient.dishes && ingredient.dishes.length > 0;

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div
          className="confirm-card"
          style={{ maxWidth: hasDishes ? "720px" : "560px" }}
        >
          {error && (
            <div style={{ marginBottom: "20px" }}>
              <ErrorAlert error={error} />
            </div>
          )}

          <h1
            className="confirm-title"
            style={{ color: hasDishes ? "var(--burgundy)" : undefined }}
          >
            {hasDishes
              ? "Không Thể Xóa Nguyên Liệu Này"
              : "Xác Nhận Xóa Nguyên Liệu"}
          </h1>

          <div className="confirm-target-box" style={{ marginTop: "20px" }}>
            <div className="target-title">{ingredient.name}</div>
            <div className="target-meta">
              <span>
                Tồn kho: {(ingredient.quantity || 0).toLocaleString("vi-VN")}{" "}
                {ingredient.unit}
              </span>
            </div>
          </div>

          {hasDishes ? (
            <>
              <div
                style={{
                  background: "rgba(127, 29, 29, 0.06)",
                  border: "1px solid rgba(127, 29, 29, 0.2)",
                  borderRadius: "var(--radius-sm)",
                  padding: "18px 20px",
                  margin: "24px 0",
                }}
              >
                <h4
                  style={{
                    color: "var(--burgundy)",
                    marginBottom: "8px",
                    fontSize: "1.05rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Đang có {ingredient.dishes.length} món ăn trong thực đơn sử dụng nguyên liệu này
                </h4>
                <p
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--text-dark)",
                    lineHeight: 1.6,
                    marginBottom: "14px",
                  }}
                >
                  Vui lòng gỡ nguyên liệu <strong>{ingredient.name}</strong> khỏi các món ăn dưới đây trước khi thực hiện xóa:
                </p>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  {ingredient.dishes.map((dish) => {
                    const fallbackImg = `/assets/img/food-${(((dish.id - 1) % 6) + 1)}.svg`;
                    const displayImg = dish.imageUrl || fallbackImg;

                    return (
                      <div
                        key={dish.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          background: "var(--white)",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #E7E5E4",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            minWidth: 0,
                          }}
                        >
                          <img
                            src={displayImg}
                            alt={dish.name}
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "4px",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = fallbackImg;
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <Link
                              to={`/admin/dishes/${dish.id}`}
                              style={{
                                fontWeight: 700,
                                color: "var(--charcoal)",
                                textDecoration: "none",
                                fontSize: "0.95rem",
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dish.name}
                            </Link>
                            <span
                              className="menu-item__tag"
                              style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                            >
                              {dish.category || "Món chung"}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/admin/dishes/${dish.id}/edit`}
                          className="btn-xs btn-xs-edit"
                          style={{ flexShrink: 0 }}
                        >
                          Sửa Món ↗
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="confirm-actions">
                <Link
                  to="/admin/ingredients"
                  className="btn btn--primary"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  ← Quay Lại Kho Nguyên Liệu
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="confirm-warning-note">
                Lưu ý: Nguyên liệu sau khi xóa sẽ không thể khôi phục lại.
              </div>

              <div className="confirm-actions">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="btn btn--primary"
                  style={{
                    background: "var(--burgundy)",
                    color: "#fff",
                    width: "100%",
                  }}
                >
                  {submitting ? "Đang Xóa..." : "Xác Nhận Xóa"}
                </button>
                <Link
                  to="/admin/ingredients"
                  className="btn btn--ghost"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  Hủy Bỏ và Quay Lại
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
