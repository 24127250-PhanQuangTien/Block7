import { ArrowDown, ArrowRight, Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { dishApi } from "../../apiClient";
import { LoadingSpinner, ErrorAlert, EmptyState } from "../../components/StateViews";

export default function DishList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([
    "Món Nước",
    "Món Khô",
    "Món Cơm",
    "Khai Vị",
    "Tráng Miệng",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(qParam);

  const fetchDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dishApi.list({ q: qParam, category: categoryParam });
      setDishes(data);

      const dbCats = Array.from(new Set(data.map((d) => d.category).filter(Boolean)));
      if (dbCats.length > 0) {
        setCategories((prev) => Array.from(new Set([...prev, ...dbCats])));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchTerm(qParam);
    fetchDishes();
  }, [qParam, categoryParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set("q", searchTerm.trim());
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === categoryParam || !cat) {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams);
  };

  return (
    <>
      {/* Page Hero Section */}
      <section className="page-hero menu-hero" aria-labelledby="menu-hero-title">
        <picture className="page-hero__bg" aria-hidden="true">
          <source media="(max-width: 600px)" srcSet="/assets/img/menu-hero-800.webp" />
          <img src="/assets/img/menu-hero-1600.webp" width="1600" height="666" alt="" fetchpriority="high" decoding="async" />
        </picture>
        <div className="page-hero__overlay"></div>
        <div className="container page-hero__content">
          <p className="menu-hero__eyebrow">Thực đơn RESTORAN</p>
          <h1 id="menu-hero-title" className="page-hero__title">Hương vị Việt,<br />trọn vẹn từng món</h1>
          <p className="menu-hero__description">
            Khám phá những món Việt quen thuộc, từ tô phở nóng đến gỏi cuốn thanh mát.
          </p>
          <a className="btn btn--primary" href="#thuc-don">Khám phá thực đơn <ArrowDown className="ui-icon" aria-hidden="true" /></a>
        </div>
      </section>

      {/* Menu Section */}
      <section id="thuc-don" className="section menu-section">
        <div className="container">
          <div className="section-header">
            <span className="section-header__label">Tuyển Chọn Tinh Hoa</span>
            <h2 className="section-header__title">Hương Vị Đặc Sắc</h2>
            <div className="section-header__divider"></div>
            <p className="section-header__text">
              Mỗi món ăn bắt đầu từ những nguyên liệu tươi ngon nhất, chuẩn bị bởi kỹ nghệ ẩm thực gia truyền.
            </p>
          </div>

          {/* Thanh Lọc Phân Loại Món Sang Trọng */}
          <div className="category-filter-bar" style={{ justifyContent: "center", marginBottom: "30px" }}>
            <button
              type="button"
              className={`category-pill ${!categoryParam ? "active" : ""}`}
              onClick={() => handleCategorySelect("")}
            >
              Tất cả món
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${categoryParam === cat ? "active" : ""}`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Thanh Tìm Kiếm */}
          <div className="search-section">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  name="q"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm món ăn theo tên (Ví dụ: Phở, Bún chả...)"
                  aria-label="Tìm món ăn"
                  className="search-input"
                />
                {qParam && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="btn-clear"
                    title="Xóa bộ lọc"
                    aria-label="Xóa tìm kiếm món ăn"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <X className="ui-icon" aria-hidden="true" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn--primary">
                <Search className="ui-icon" aria-hidden="true" /> Tìm Kiếm
              </button>
            </form>
            {qParam && (
              <div className="search-status">
                Kết quả tìm kiếm cho từ khóa: <strong>"{qParam}"</strong> (tìm thấy {dishes.length} món)
              </div>
            )}
          </div>

          {/* Trạng thái Loading */}
          {loading && <LoadingSpinner />}

          {/* Trạng thái Lỗi */}
          {!loading && error && <ErrorAlert error={error} onRetry={fetchDishes} />}

          {/* Trạng thái Danh sách rỗng */}
          {!loading && !error && dishes.length === 0 && (
            <EmptyState
              title="Không tìm thấy món ăn nào"
              message="Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn phân loại khác."
              actionLink="/dishes"
              actionText="Xem Tất Cả Món Ăn"
            />
          )}

          {/* Danh Sách Món Ăn */}
          {!loading && !error && dishes.length > 0 && (
            <div className="menu-grid">
              {dishes.map((dish) => {
                const imgIndex = ((dish.id - 1) % 6) + 1;
                const fallbackImg = `/assets/img/food-${imgIndex}.svg`;
                const displayImg = dish.imageUrl || fallbackImg;

                return (
                  <div key={dish.id} className="menu-item">
                    <div className="menu-item__image">
                      <img
                        src={displayImg}
                        alt={dish.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImg;
                        }}
                      />
                    </div>
                    <div className="menu-item__info">
                      <div className="menu-item__header">
                        <Link to={`/dishes/${dish.id}`} className="menu-item__name">
                          {dish.name}
                        </Link>
                        <span className="menu-item__dots"></span>
                        <span className="menu-item__price">
                          {dish.price.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      {(dish.chef || (dish.ingredients && dish.ingredients.length > 0)) && (
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-muted)",
                            marginBottom: "10px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {dish.chef && (
                            <span style={{ color: "var(--burgundy)", fontWeight: 600 }}>
                              Bếp: {dish.chef.name}
                            </span>
                          )}
                          {dish.ingredients && dish.ingredients.length > 0 && (
                            <span>
                              Nguyên liệu: {dish.ingredients.slice(0, 3).map((i) => i.name).join(", ")}
                              {dish.ingredients.length > 3 ? "..." : ""}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="menu-item__tags">
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
                        <Link
                          to={`/dishes/${dish.id}`}
                          className="menu-item__tag menu-item__tag--unit"
                        >
                          Xem Chi Tiết <ArrowRight className="ui-icon" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
