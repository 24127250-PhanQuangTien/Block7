import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { dishApi } from "../../../apiClient";
import { buildDishSearchParams } from "../../../utils/search";
import { ErrorAlert, LoadingSkeleton } from "../../../components/StateViews";

const categories = [
  "Khai Vị",
  "Món Cơm",
  "Món Khô",
  "Món Lẩu",
  "Món Nước",
  "Món Nướng",
  "Tráng Miệng",
  "Đồ Uống",
];
const pageSizes = [10, 20, 50];

function setOptional(params, key, value) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export default function AdminDishList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState({
    q: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    available: "",
    sort: "id_asc",
  });
  const [searchEpoch, setSearchEpoch] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const paramsText = searchParams.toString();
  const appliedParams = useMemo(() => new URLSearchParams(paramsText), [paramsText]);
  const activeCategory = appliedParams.get("category") || "";
  const page = appliedParams.get("page") || "1";
  const pageSize = appliedParams.get("pageSize") || "10";
  const currentPage = Math.max(1, Number(page) || 1);
  useEffect(() => {
    setDraft({
      q: appliedParams.get("q") || "",
      category: appliedParams.get("category") || "",
      minPrice: appliedParams.get("minPrice") || "",
      maxPrice: appliedParams.get("maxPrice") || "",
      available:
        appliedParams.get("available") ||
        (appliedParams.get("status") === "available"
          ? "true"
          : appliedParams.get("status") === "unavailable"
          ? "false"
          : ""),
      sort: appliedParams.get("sort") || "id_asc",
    });
  }, [paramsText, appliedParams]);

  const requestParams = useCallback(
    (requestPage) => buildDishSearchParams(new URLSearchParams(paramsText), "fuzzy", requestPage),
    [paramsText],
  );

  const pageRequest = useCallback(
    (signal) => dishApi.listPage(requestParams(page), signal),
    [page, requestParams],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setPageData(null);
    setPageLoading(true);
    setPageError(null);
    pageRequest(controller.signal)
      .then((data) => {
        if (active) setPageData(data);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") setPageError(error);
      })
      .finally(() => {
        if (active) setPageLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [pageRequest, paramsText, searchEpoch]);

  const changeUrl = (updates, clearKeys = []) => {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    params.set("mode", "advanced");
    params.set("match", "fuzzy");
    clearKeys.forEach((key) => params.delete(key));
    Object.entries(updates).forEach(([key, value]) => setOptional(params, key, String(value)));
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleCategoryQuickFilter = (categoryValue) => {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    params.set("mode", "advanced");
    params.set("match", "fuzzy");
    const nextCat = categoryValue === activeCategory ? "" : categoryValue;
    if (nextCat) {
      params.set("category", nextCat);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    setSearchParams(params);
    setSearchEpoch((epoch) => epoch + 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    params.set("mode", "advanced");
    params.set("match", "fuzzy");
    params.delete("status");
    setOptional(params, "q", draft.q.trim());
    setOptional(params, "sort", draft.sort);
    ["category", "minPrice", "maxPrice", "available"].forEach((key) =>
      setOptional(params, key, draft[key].trim()),
    );
    params.set("page", "1");
    setSearchParams(params);
    setSearchEpoch((epoch) => epoch + 1);
  };

  const clearConditions = () => {
    setDraft({
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      available: "",
      sort: "id_asc",
    });
    const params = new URLSearchParams();
    params.delete("view");
    params.set("mode", "advanced");
    params.set("match", "fuzzy");
    params.set("pageSize", pageSize);
    params.set("page", "1");
    setSearchParams(params);
    setSearchEpoch((epoch) => epoch + 1);
  };

  const handlePageSize = (value) => changeUrl({ pageSize: value });
  const handlePage = (value) => {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    params.set("mode", "advanced");
    params.set("match", "fuzzy");
    params.set("page", String(value));
    setSearchParams(params);
  };
  const retryPage = () => {
    setSearchEpoch((epoch) => epoch + 1);
  };

  const pageCount = pageData ? Math.ceil(pageData.total / pageData.pageSize) : 0;
  const pageWindow = Array.from(
    { length: Math.max(0, Math.min(pageCount, 5)) },
    (_, index) => {
      const first = Math.min(Math.max(1, currentPage - 2), Math.max(1, pageCount - 4));
      return first + index;
    },
  );
  const visiblePages = [...new Set([...(pageCount > 5 ? [1] : []), ...pageWindow, ...(pageCount > 5 ? [pageCount] : [])])];
  const shownDishes = pageData?.items || [];
  const resultTotal = pageData?.total;

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
              <Plus className="ui-icon" aria-hidden="true" /> Thêm Món Ăn Mới
            </Link>
          </div>
        </div>

        <div className="dish-search-panel">
          {/* Tổng kết quả tìm kiếm */}
          <div className="dish-results-toolbar">
            {resultTotal !== null && resultTotal !== undefined && (
              <span className="dish-results-count">
                {resultTotal.toLocaleString("vi-VN")} món phù hợp
              </span>
            )}
          </div>

          {/* 2. Thanh lọc nhanh theo danh mục (Tag Pills) gọn gàng */}
          <div className="dish-category-strip" role="group" aria-label="Lọc nhanh theo phân loại">
            <span className="category-filter-label">Phân loại:</span>
            <button
              type="button"
              className={`category-pill ${!activeCategory ? "active" : ""}`}
              onClick={() => handleCategoryQuickFilter("")}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-pill ${activeCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryQuickFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 3. Form tìm kiếm và lọc chi tiết giống trang khách hàng */}
          <form className="dish-search-form" onSubmit={handleSubmit}>
            <div className="dish-search-primary-fields dish-search-primary-fields--fixed">
              <div className="dish-form-field dish-form-field--query">
                <label htmlFor="admin-dish-search-query">Từ khóa</label>
                <input
                  id="admin-dish-search-query"
                  type="search"
                  value={draft.q}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, q: event.target.value }))
                  }
                  placeholder="Tìm món ăn hoặc nguyên liệu..."
                />
              </div>

              <div className="dish-form-field">
                <label htmlFor="admin-dish-search-sort">Sắp xếp</label>
                <select
                  id="admin-dish-search-sort"
                  value={draft.sort}
                  disabled={Boolean(draft.q.trim())}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, sort: event.target.value }))
                  }
                >
                  <option value="id_asc">Mặc định</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>

              <div className="dish-form-field">
                <label htmlFor="admin-dish-page-size">Món mỗi trang</label>
                <select
                  id="admin-dish-page-size"
                  value={pageSize}
                  onChange={(event) => handlePageSize(event.target.value)}
                >
                  {pageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(
              <div className="dish-search-advanced-fields">
                <div className="dish-form-field">
                  <label htmlFor="admin-dish-min-price">Giá từ</label>
                  <input
                    id="admin-dish-min-price"
                    type="number"
                    min="0"
                    value={draft.minPrice}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, minPrice: event.target.value }))
                    }
                  />
                </div>
                <div className="dish-form-field">
                  <label htmlFor="admin-dish-max-price">Đến giá</label>
                  <input
                    id="admin-dish-max-price"
                    type="number"
                    min="0"
                    value={draft.maxPrice}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, maxPrice: event.target.value }))
                    }
                  />
                </div>
                <div className="dish-form-field">
                  <label htmlFor="admin-dish-availability">Trạng thái</label>
                  <select
                    id="admin-dish-availability"
                    value={draft.available}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, available: event.target.value }))
                    }
                  >
                    <option value="">Tất cả</option>
                    <option value="true">Còn bán</option>
                    <option value="false">Hết hàng</option>
                  </select>
                </div>
              </div>
            )}

            <div className="dish-search-footer">
              <div className="dish-search-actions">
                <button className="btn btn--primary" type="submit">
                  <Search className="ui-icon" aria-hidden="true" /> Tìm kiếm
                </button>
                <button className="btn btn--outline" type="button" onClick={clearConditions}>
                  <X className="ui-icon" aria-hidden="true" /> Xóa điều kiện
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Trạng thái Loading / Lỗi */}
        {pageLoading && (
          <LoadingSkeleton variant="table" columns={9} rows={pageSizes.includes(Number(pageSize)) ? Number(pageSize) : 10} />
        )}
        {!pageLoading && pageError && (
          <ErrorAlert error={pageError} onRetry={retryPage} />
        )}
        {/* Bảng quản trị món ăn */}
        {(!pageLoading && !pageError) && (
          <div className="admin-table-card admin-dish-table-card">
            <table className="data-table admin-dish-table">
              <thead>
                <tr>
                  <th className="dish-column-id">ID</th>
                  <th className="dish-column-image">Ảnh</th>
                  <th className="dish-column-name">Tên Món Ăn</th>
                  <th className="dish-column-category">Phân Loại</th>
                  <th className="dish-column-chef">Đầu Bếp</th>
                  <th className="dish-column-ingredients">Nguyên Liệu</th>
                  <th className="dish-column-price">Đơn Giá</th>
                  <th className="dish-column-status">Trạng Thái</th>
                  <th className="dish-column-actions">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {shownDishes.length === 0 ? (
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
                        Không tìm thấy món ăn nào phù hợp với điều kiện đã chọn.
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
                        onClick={clearConditions}
                        className="btn btn--outline"
                      >
                        Xóa điều kiện
                      </button>
                    </td>
                  </tr>
                ) : (
                  shownDishes.map((dish) => {
                    const fallbackImg = `/assets/img/food-${(((dish.id - 1) % 6) + 1)}.svg`;
                    const displayImg = dish.imageUrl || fallbackImg;

                    return (
                      <tr key={dish.id}>
                        <td className="dish-column-id">
                          <strong>#{dish.id}</strong>
                        </td>
                        <td className="dish-column-image">
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
                        <td className="dish-column-category">
                          <span className="menu-item__tag" style={{ margin: 0 }}>
                            {dish.category || "Món chung"}
                          </span>
                        </td>
                        <td className="dish-column-chef">
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
                        <td className="dish-column-ingredients">
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
                        <td className="dish-column-price">
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
                        <td className="dish-column-status">
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
                        <td className="action-cell dish-column-actions">
                          <div className="dish-actions">
                            <Link
                              to={`/admin/dishes/${dish.id}`}
                              className="btn-xs btn-xs-view"
                              title="Xem"
                              aria-label="Xem"
                            >
                              <Eye className="ui-icon" aria-hidden="true" />
                            </Link>
                            <Link
                              to={`/admin/dishes/${dish.id}/edit`}
                              className="btn-xs btn-xs-edit"
                              title="Sửa"
                              aria-label="Sửa"
                            >
                              <Pencil className="ui-icon" aria-hidden="true" />
                            </Link>
                            <Link
                              to={`/admin/dishes/${dish.id}/delete`}
                              className="btn-xs btn-xs-delete"
                              title="Xóa"
                              aria-label="Xóa"
                            >
                              <Trash2 className="ui-icon" aria-hidden="true" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Thanh phân trang theo Số trang (pages) */}
        {!pageLoading && !pageError && pageData && pageCount > 0 && (
          <nav className="dish-pagination" aria-label="Phân trang quản trị món ăn">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePage(currentPage - 1)}
            >
              Trước
            </button>
            {visiblePages.map((number, index) => (
              <React.Fragment key={number}>
                {index > 0 && number - visiblePages[index - 1] > 1 && (
                  <span aria-hidden="true">…</span>
                )}
                <button
                  type="button"
                  className={number === currentPage ? "is-current" : ""}
                  aria-current={number === currentPage ? "page" : undefined}
                  onClick={() => handlePage(number)}
                >
                  {number}
                </button>
              </React.Fragment>
            ))}
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => handlePage(currentPage + 1)}
            >
              Sau
            </button>
          </nav>
        )}

      </div>
    </section>
  );
}
