import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { dishApi } from "../../../apiClient";
import { LoadingSpinner, ErrorAlert } from "../../../components/StateViews";

export default function AdminDishList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const statusParam = searchParams.get("status") || "";
  const sortParam = searchParams.get("sort") || "";

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

  // Form filter states
  const [filterQ, setFilterQ] = useState(qParam);
  const [filterStatus, setFilterStatus] = useState(statusParam);
  const [filterSort, setFilterSort] = useState(sortParam);

  const fetchDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dishApi.list({
        q: qParam,
        category: categoryParam,
        status: statusParam,
        sort: sortParam,
      });
      setDishes(data);

      // Thu thập thêm các danh mục xuất hiện trong dữ liệu nếu có
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
    setFilterQ(qParam);
    setFilterStatus(statusParam);
    setFilterSort(sortParam);
    fetchDishes();
  }, [qParam, categoryParam, statusParam, sortParam]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (filterQ.trim()) {
      newParams.set("q", filterQ.trim());
    } else {
      newParams.delete("q");
    }
    if (filterStatus) {
      newParams.set("status", filterStatus);
    } else {
      newParams.delete("status");
    }
    if (filterSort) {
      newParams.set("sort", filterSort);
    } else {
      newParams.delete("sort");
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

  const handleClearFilter = () => {
    setFilterQ("");
    setFilterStatus("");
    setFilterSort("");
    setSearchParams(new URLSearchParams());
  };

  const hasFilter = Boolean(qParam || categoryParam || statusParam || sortParam);

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-header__title">Quản Trị Món Ăn</h1>
            <p className="admin-header__subtitle">
              Quản lý danh sách các món ăn trong thực đơn nhà hàng.
            </p>
          </div>
          <div>
            <Link to="/admin/dishes/new" className="btn btn--primary">
              + Thêm Món Ăn Mới
            </Link>
          </div>
        </div>

        {/* Thanh Lọc Phân Loại Món Thiết Kế Dạng Pills Sang Trọng */}
        <div className="category-filter-bar">
          <span className="category-filter-label">Phân Loại:</span>
          <button
            type="button"
            className={`category-pill ${!categoryParam ? "active" : ""}`}
            onClick={() => handleCategorySelect("")}
          >
            Tất cả
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

        {/* Thanh Tìm Kiếm + Bộ Lọc Trạng Thái & Sắp Xếp */}
        <div className="admin-filter-card" style={{ marginBottom: "20px" }}>
          <form onSubmit={handleFilterSubmit} className="admin-filter-form">
            {/* 1. Ô tìm kiếm từ khóa */}
            <div className="admin-filter-field admin-filter-field--search" style={{ flex: 2 }}>
              <label className="admin-filter-label" htmlFor="filter-q">
                Tìm kiếm từ khóa
              </label>
              <input
                type="text"
                id="filter-q"
                name="q"
                value={filterQ}
                onChange={(e) => setFilterQ(e.target.value)}
                placeholder="Tìm theo tên món hoặc nguyên liệu..."
                className="admin-filter-input"
              />
            </div>

            {/* 2. Lọc theo Trạng thái bếp */}
            <div className="admin-filter-field">
              <label className="admin-filter-label" htmlFor="filter-status">
                Trạng thái bếp
              </label>
              <select
                id="filter-status"
                name="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="admin-filter-select"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Đang phục vụ</option>
                <option value="unavailable">Tạm hết món</option>
              </select>
            </div>

            {/* 3. Sắp xếp kết quả (Chỉ giữ Giá thấp/cao, bỏ tên A-Z và mới tạo nhất) */}
            <div className="admin-filter-field">
              <label className="admin-filter-label" htmlFor="filter-sort">
                Sắp xếp theo giá
              </label>
              <select
                id="filter-sort"
                name="sort"
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="admin-filter-select"
              >
                <option value="">Mặc định (ID tăng dần)</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>

            {/* Nút Thực thi & Xóa lọc */}
            <div className="admin-filter-buttons">
              <button type="submit" className="admin-filter-btn btn--primary">
                Lọc Dữ Liệu
              </button>
              {hasFilter && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="admin-filter-btn btn--ghost"
                  title="Xóa tất cả điều kiện lọc"
                >
                  Xóa Lọc
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trạng thái Loading */}
        {loading && <LoadingSpinner />}

        {/* Trạng thái Lỗi */}
        {!loading && error && <ErrorAlert error={error} onRetry={fetchDishes} />}

        {/* Bảng danh sách món ăn: 1 món nằm vừa vặn 1 dòng, không có mô tả, không cần cuộn ngang */}
        {!loading && !error && (
          <div className="admin-table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>ID</th>
                  <th style={{ width: "65px", textAlign: "center" }}>Ảnh</th>
                  <th>Tên Món Ăn</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Phân Loại</th>
                  <th style={{ width: "140px" }}>Đầu Bếp</th>
                  <th style={{ width: "95px", textAlign: "center" }}>Nguyên Liệu</th>
                  <th style={{ width: "115px", textAlign: "right" }}>Đơn Giá</th>
                  <th style={{ width: "115px", textAlign: "center" }}>Trạng Thái</th>
                  <th style={{ width: "145px", textAlign: "center" }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {dishes.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          color: "var(--text-dark)",
                          marginBottom: "8px",
                          fontFamily: "'Cormorant Garamond', serif",
                        }}
                      >
                        Không tìm thấy món ăn nào phù hợp với bộ lọc.
                      </div>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                          marginBottom: "16px",
                        }}
                      >
                        Vui lòng thử điều chỉnh lại từ khóa hoặc chọn phân loại khác.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilter}
                        className="btn btn--outline"
                        style={{ color: "var(--charcoal)", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        Xóa Bộ Lọc
                      </button>
                    </td>
                  </tr>
                ) : (
                  dishes.map((dish) => {
                    const fallbackImg = `/assets/img/food-${(((dish.id - 1) % 6) + 1)}.svg`;
                    const displayImg = dish.imageUrl || fallbackImg;

                    return (
                      <tr key={dish.id}>
                        <td style={{ textAlign: "center" }}>
                          <strong>#{dish.id}</strong>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Link to={`/admin/dishes/${dish.id}`}>
                            <img
                              src={displayImg}
                              alt={dish.name}
                              className="dish-thumb"
                              style={{ width: "45px", height: "45px" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackImg;
                              }}
                            />
                          </Link>
                        </td>
                        <td>
                          <Link
                            to={`/admin/dishes/${dish.id}`}
                            className="dish-name-cell"
                          >
                            {dish.name}
                          </Link>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="menu-item__tag" style={{ margin: 0 }}>
                            {dish.category || "Món chung"}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              color: "var(--charcoal)",
                            }}
                          >
                            {dish.chef ? dish.chef.name : "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {(() => {
                            const ingNames = dish.ingredients
                              ? dish.ingredients.map((i) => i.name).join(", ")
                              : "";
                            return (
                              <span
                                className="menu-item__tag menu-item__tag--unit"
                                title={ingNames}
                                style={{ margin: 0, cursor: "help" }}
                              >
                                {dish.ingredients ? dish.ingredients.length : 0} loại
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <strong
                            style={{
                              color: "var(--burgundy)",
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: "1.2rem",
                            }}
                          >
                            {dish.price.toLocaleString("vi-VN")} đ
                          </strong>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`menu-item__tag ${
                              dish.available
                                ? "menu-item__tag--available"
                                : "menu-item__tag--unavailable"
                            }`}
                            style={{ margin: 0 }}
                          >
                            {dish.available ? "Đang phục vụ" : "Tạm hết"}
                          </span>
                        </td>
                        <td className="action-cell" style={{ textAlign: "center" }}>
                          <Link
                            to={`/admin/dishes/${dish.id}`}
                            className="btn-xs btn-xs-view"
                          >
                            Xem
                          </Link>
                          <Link
                            to={`/admin/dishes/${dish.id}/edit`}
                            className="btn-xs btn-xs-edit"
                          >
                            Sửa
                          </Link>
                          <Link
                            to={`/admin/dishes/${dish.id}/delete`}
                            className="btn-xs btn-xs-delete"
                          >
                            Xóa
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
