import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { dishApi } from "../../../apiClient";
import { LoadingSpinner, ErrorAlert, NotFoundCard } from "../../../components/StateViews";

export default function AdminDishDetail() {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

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

  useEffect(() => {
    fetchDish();
  }, [id]);

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

  if (error) {
    return (
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <ErrorAlert error={error} onRetry={fetchDish} />
        </div>
      </section>
    );
  }

  if (!dish) return null;

  const imgIndex = ((dish.id - 1) % 6) + 1;
  const fallbackImg = `/assets/img/food-${imgIndex}.svg`;
  const displayImg = dish.imageUrl || fallbackImg;

  return (
    <>
      {/* Page Hero Section */}
      <section className="page-hero">
        <div className="page-hero__bg">
          <img src="/assets/img/menu-bg.svg" alt={dish.name} />
        </div>
        <div className="page-hero__overlay"></div>
        <div className="container page-hero__content">
          <h1 className="page-hero__title">{dish.name}</h1>
          <p className="page-hero__breadcrumb">
            <Link to="/admin/dishes">Cổng Quản Trị</Link> &nbsp;/&nbsp; Chi Tiết Món Ăn #{dish.id}
          </p>
        </div>
      </section>

      {/* Detail Section với quyền Quản Trị (Sửa & Xóa) */}
      <section className="section">
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="detail-card">
            <div className="detail-layout">
              <div className="detail-image-box">
                <img
                  src={displayImg}
                  alt={dish.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImg;
                  }}
                />
              </div>

              <div className="detail-info">
                <div className="detail-badges">
                  {dish.category && (
                    <span className="menu-item__tag">{dish.category}</span>
                  )}
                  <span
                    className={`menu-item__tag ${
                      dish.available
                        ? "menu-item__tag--available"
                        : "menu-item__tag--unavailable"
                    }`}
                  >
                    {dish.available ? "Đang phục vụ" : "Tạm hết"}
                  </span>
                  <span className="menu-item__tag menu-item__tag--unit">
                    Mã món: #{dish.id}
                  </span>
                </div>

                <h2 className="detail-title">{dish.name}</h2>
                <div className="detail-price-text">
                  {dish.price.toLocaleString("vi-VN")} VNĐ
                </div>

                <p className="detail-desc">
                  {dish.description
                    ? dish.description
                    : "Món ăn đặc sản mang đậm phong vị ẩm thực truyền thống của nhà hàng."}
                </p>

                <div className="detail-meta-list">
                  <div>
                    <div className="meta-label">Ngày Tạo</div>
                    <div className="meta-value">
                      {new Date(dish.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="meta-label">Phân Loại Món</div>
                    <div className="meta-value">
                      {dish.category ? dish.category : "Món chung"}
                    </div>
                  </div>
                  <div>
                    <div className="meta-label">Tình Trạng Bếp</div>
                    <div className="meta-value">
                      {dish.available ? "Sẵn sàng phục vụ" : "Tạm dừng nhận order"}
                    </div>
                  </div>
                  <div>
                    <div className="meta-label">Đầu Bếp Phụ Trách</div>
                    <div className="meta-value">
                      {dish.chef ? (
                        <>
                          <strong>{dish.chef.name}</strong>{" "}
                          <small
                            style={{
                              color: "var(--text-muted)",
                              display: "block",
                              fontSize: "0.8rem",
                            }}
                          >
                            Đầu bếp ({dish.chef.specialty || "Ẩm thực"})
                          </small>
                        </>
                      ) : (
                        <em>Chưa chỉ định</em>
                      )}
                    </div>
                  </div>
                </div>

                {/* Danh sách nguyên liệu */}
                <div
                  style={{
                    margin: "18px 0",
                    padding: "16px 18px",
                    background: "var(--cream)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid #E7E5E4",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "var(--text-dark)",
                      marginBottom: "10px",
                    }}
                  >
                    Danh Sách Nguyên Liệu Chế Biến ({dish.ingredients ? dish.ingredients.length : 0})
                  </h4>
                  {dish.ingredients && dish.ingredients.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {dish.ingredients.map((ing) => (
                        <span
                          key={ing.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 12px",
                            background: "var(--white)",
                            border: "1px solid #D6D3D1",
                            borderRadius: "20px",
                            fontSize: "0.86rem",
                            color: "var(--charcoal)",
                          }}
                        >
                          <strong style={{ color: "var(--burgundy)" }}>{ing.name}</strong>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            (Tồn: {(ing.quantity || 0).toLocaleString("vi-VN")} {ing.unit})
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                      Chưa liên kết nguyên liệu nào cho món ăn này.
                    </p>
                  )}
                </div>

                {/* Các nút thao tác trong chế độ Quản Trị */}
                <div
                  className="detail-actions"
                  style={{
                    display: "flex",
                    gap: "14px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <Link to="/admin/dishes" className="btn btn--primary">
                    ← Về Danh Sách Quản Trị
                  </Link>
                  <Link
                    to={`/admin/dishes/${dish.id}/edit`}
                    className="btn btn--outline"
                    style={{ color: "var(--charcoal)" }}
                  >
                    Sửa Món Ăn
                  </Link>
                  <Link to={`/admin/dishes/${dish.id}/delete`} className="btn btn--ghost">
                    Xóa Món Ăn
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
