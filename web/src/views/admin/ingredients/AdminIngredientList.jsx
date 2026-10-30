import { Pencil, Plus, Search, Tags, Trash2, X } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ingredientApi } from "../../../apiClient";
import { LoadingSkeleton, ErrorAlert } from "../../../components/StateViews";
import {
  INGREDIENT_TAGS,
  getIngredientCategory,
  getCategoryBadgeClass,
} from "../../../utils/ingredientUtils";

export default function AdminIngredientList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const catParam = searchParams.get("category") || "Tất cả";
  const unitParam = searchParams.get("unit") || "";

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQ, setSearchQ] = useState(qParam);
  const [searchUnit, setSearchUnit] = useState(unitParam);

  const fetchIngredients = useCallback(async (signal) =>
  {
    setLoading(true);
    setError(null);
    try {
      const data = await ingredientApi.list({ mode: "advanced", match: "fuzzy", q: qParam, category: catParam, unit: unitParam }, signal);
      if (!signal?.aborted) setIngredients(data);
    } catch (err) {
      if (!signal?.aborted && err.name !== "AbortError") setError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [qParam, catParam, unitParam]);

  useEffect(() => {
    const controller = new AbortController();
    setSearchQ(qParam);
    setSearchUnit(unitParam);
    fetchIngredients(controller.signal);
    return () => controller.abort();
  }, [qParam, unitParam, fetchIngredients]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set("mode", "advanced");
    newParams.set("match", "fuzzy");
    if (searchUnit.trim())
    {
      newParams.set("unit", searchUnit.trim());
    }
    else
    {
      newParams.delete("unit");
    }
    if (searchQ.trim()) {
      newParams.set("q", searchQ.trim());
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQ("");
    setSearchUnit("");
    setSearchParams(new URLSearchParams());
  };

  const handleTagClick = (tag) => {
    const newParams = new URLSearchParams(searchParams);
    if (tag === "Tất cả") {
      newParams.delete("category");
    } else {
      newParams.set("category", tag);
    }
    setSearchParams(newParams);
  };

  const filteredIngredients = ingredients;

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-header__title">Quản Trị Kho Nguyên Liệu</h1>
            <p className="admin-header__subtitle">
              Danh mục các nguyên liệu và đơn vị tính dùng trong bếp nhà hàng.
            </p>
          </div>
          <div>
            <Link to="/admin/ingredients/new" className="btn btn--primary">
              <Plus className="ui-icon" aria-hidden="true" /> Thêm Nguyên Liệu
            </Link>
          </div>
        </div>

        {/* Thanh Tìm Kiếm & Bộ Lọc Theo Tag Nguyên Liệu */}
        <div className="admin-filter-card">
          <form onSubmit={handleSearchSubmit} className="admin-filter-form">
            <div className="admin-filter-field admin-filter-field--search">
              <label className="admin-filter-label" htmlFor="filter-q">
                Tìm kiếm nguyên liệu
              </label>
              <input
                type="text"
                id="filter-q"
                name="q"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Nhập tên nguyên liệu ..."
                className="admin-filter-input"
              />
            </div>
            <div className="admin-filter-field">
              <label className="admin-filter-label" htmlFor="filter-unit">Đơn vị tính</label>
              <input
                id="filter-unit"
                value={searchUnit}
                onChange={(event) => setSearchUnit(event.target.value)}
                placeholder="Ví dụ: kg, gam, bó"
                className="admin-filter-input"
              />
            </div>
            <div className="admin-filter-buttons">
              <button type="submit" className="admin-filter-btn btn--primary">
                <Search className="ui-icon" aria-hidden="true" /> Tìm Kiếm
              </button>
              {(qParam || unitParam || (catParam && catParam !== "Tất cả")) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="admin-filter-btn btn--ghost"
                >
                  <X className="ui-icon" aria-hidden="true" /> Xóa Bộ Lọc
                </button>
              )}
            </div>
          </form>

          {/* Thanh lọc theo Tag: Gia vị, Rau, Bún, Thịt, Hải sản */}
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid #E7E5E4",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: "700",
                color: "var(--charcoal)",
                marginRight: "4px",
              }}
            >
              <Tags className="ui-icon" aria-hidden="true" /> Lọc theo tag:
            </span>
            <div className="ingredient-tags-container">
              {INGREDIENT_TAGS.map((tag) => {
                const isActive = catParam.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`ingredient-tag-btn ${isActive ? "active" : ""}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trạng thái Loading */}
        {loading && <LoadingSkeleton variant="table" columns={8} />}

        {/* Trạng thái Lỗi */}
        {!loading && error && <ErrorAlert error={error} onRetry={() => fetchIngredients()} />}

        {/* Bảng dữ liệu nguyên liệu */}
        {!loading && !error && (
          <div className="admin-table-card">
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>ID</th>
                    <th>Tên Nguyên Liệu</th>
                    <th style={{ width: "120px" }}>Phân Loại</th>
                    <th style={{ textAlign: "right" }}>Số Lượng</th>
                    <th>Đơn Vị Tính</th>
                    <th style={{ textAlign: "center" }}>Món Sử Dụng</th>
                    <th>Ngày Nhập Kho</th>
                    <th style={{ width: "180px", textAlign: "center" }}>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                        Chưa có nguyên liệu nào phù hợp với tìm kiếm và tag đang chọn.
                        {(qParam || (catParam && catParam !== "Tất cả")) && (
                          <div style={{ marginTop: "12px" }}>
                            <button
                              type="button"
                              onClick={handleClearSearch}
                              className="btn btn--ghost"
                            >
                              Xem tất cả nguyên liệu
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((item) => {
                      const dishCount = item._count ? item._count.dishes : 0;
                      const catName = getIngredientCategory(item);
                      return (
                        <tr key={item.id}>
                          <td>
                            <strong>#{item.id}</strong>
                          </td>
                          <td>
                            <strong style={{ color: "var(--charcoal)", fontSize: "1.02rem" }}>
                              {item.name}
                            </strong>
                          </td>
                          <td>
                            <span className={getCategoryBadgeClass(catName)}>
                              {catName}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <strong
                              style={{
                                color: "var(--burgundy)",
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "1.25rem",
                              }}
                            >
                              {(item.quantity || 0).toLocaleString("vi-VN")}
                            </strong>
                          </td>
                          <td>
                            <span className="menu-item__tag menu-item__tag--unit">
                              {item.unit}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              className={`menu-item__tag ${
                                dishCount > 0
                                  ? "menu-item__tag--available"
                                  : "menu-item__tag--unavailable"
                              }`}
                            >
                              {dishCount} món
                            </span>
                          </td>
                          <td>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                          <td className="action-cell">
                            <Link
                              to={`/admin/ingredients/${item.id}/edit`}
                              className="btn-xs btn-xs-edit"
                            >
                              <Pencil className="ui-icon" aria-hidden="true" /> Sửa
                            </Link>
                            <Link
                              to={`/admin/ingredients/${item.id}/delete`}
                              className="btn-xs btn-xs-delete"
                            >
                              <Trash2 className="ui-icon" aria-hidden="true" /> Xóa
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
