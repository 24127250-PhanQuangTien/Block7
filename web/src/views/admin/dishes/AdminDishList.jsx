import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { dishApi } from "../../../apiClient";
import { ErrorAlert, LoadingSpinner } from "../../../components/StateViews";

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
const searchModeDescriptions = {
  basic: "Tên món chứa từ khóa.",
  advanced: "Kết hợp từ khóa, danh mục, khoảng giá, còn bán.",
  fulltext: "Tìm các từ trong tên và mô tả, không cần liền nhau.",
  fuzzy: "Tìm tên món giống từ khóa, chịu được gõ sai nhẹ.",
};

function setOptional(params, key, value) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export default function AdminDishList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState({
    mode: "basic",
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
  const [items, setItems] = useState([]);
  const [incrementalTotal, setIncrementalTotal] = useState(null);
  const [nextPage, setNextPage] = useState(1);
  const [pending, setPending] = useState(false);
  const [incrementalEnd, setIncrementalEnd] = useState(false);
  const [incrementalError, setIncrementalError] = useState(null);

  const paramsText = searchParams.toString();
  const appliedParams = useMemo(() => new URLSearchParams(paramsText), [paramsText]);
  const view = ["pages", "load-more", "infinite"].includes(appliedParams.get("view"))
    ? appliedParams.get("view")
    : "pages";
  const mode =
    appliedParams.get("mode") ||
    (appliedParams.has("category") || appliedParams.has("status") ? "advanced" : "basic");
  const activeCategory = appliedParams.get("category") || "";
  const page = appliedParams.get("page") || "1";
  const pageSize = appliedParams.get("pageSize") || "10";
  const currentPage = Math.max(1, Number(page) || 1);
  const sentinelRef = useRef(null);
  const pendingRef = useRef(false);
  const endRef = useRef(false);
  const controllerRef = useRef(null);
  const generationRef = useRef(0);
  const incrementalKeyRef = useRef("");

  useEffect(() => {
    setDraft({
      mode:
        appliedParams.get("mode") ||
        (appliedParams.has("category") || appliedParams.has("status") ? "advanced" : "basic"),
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
    (requestPage) => {
      const query = new URLSearchParams(paramsText);
      const result = {
        mode: query.get("mode") || (query.has("category") || query.has("status") ? "advanced" : "basic"),
        page: requestPage,
        pageSize: query.get("pageSize") || "10",
        sort: query.get("sort") || "id_asc",
      };
      const q = query.get("q");
      if (q !== null) result.q = q;
      if (result.mode === "advanced") {
        ["category", "minPrice", "maxPrice", "available"].forEach((key) => {
          const value = query.get(key);
          if (value !== null) result[key] = value;
        });
        if (!query.has("available") && query.get("status")) {
          result.available = query.get("status") === "available" ? "true" : "false";
        }
      }
      return result;
    },
    [paramsText],
  );

  const pageRequest = useCallback(
    (signal) => dishApi.listPage(requestParams(page), signal),
    [page, requestParams],
  );

  useEffect(() => {
    if (view !== "pages") return undefined;
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
  }, [pageRequest, paramsText, searchEpoch, view]);

  const incrementalKey = useMemo(() => {
    const query = new URLSearchParams(paramsText);
    query.delete("page");
    query.delete("view");
    return `${view}:${query.toString()}`;
  }, [paramsText, view]);

  useLayoutEffect(() => {
    generationRef.current += 1;
    controllerRef.current?.abort();
    pendingRef.current = false;
    endRef.current = false;
    incrementalKeyRef.current = incrementalKey;
    setItems([]);
    setIncrementalTotal(null);
    setNextPage(1);
    setPending(false);
    setIncrementalEnd(false);
    setIncrementalError(null);
    return () => {
      generationRef.current += 1;
      controllerRef.current?.abort();
    };
  }, [incrementalKey, searchEpoch]);

  const loadNext = useCallback(async () => {
    if (pendingRef.current || endRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setIncrementalError(null);
    const generation = generationRef.current;
    const requestPage = nextPage;
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data = await dishApi.listPage(
        requestParams(requestPage),
        controller.signal,
      );
      if (
        generation !== generationRef.current ||
        incrementalKey !== incrementalKeyRef.current
      ) {
        return;
      }
      setItems((current) => [...current, ...data.items]);
      setIncrementalTotal(data.total);
      setNextPage(data.page + 1);
      const reachedEnd = data.page * data.pageSize >= data.total || data.items.length === 0;
      endRef.current = reachedEnd;
      setIncrementalEnd(reachedEnd);
    } catch (error) {
      if (generation === generationRef.current && error.name !== "AbortError") {
        setIncrementalError(error);
      }
    } finally {
      if (generation === generationRef.current) {
        pendingRef.current = false;
        setPending(false);
      }
    }
  }, [incrementalKey, nextPage, requestParams]);

  // Ở chế độ "Tải thêm" (load-more), tự động tải sẵn trang đầu tiên theo pageSize đã chọn
  useEffect(() => {
    if (
      view === "load-more" &&
      items.length === 0 &&
      nextPage === 1 &&
      !pending &&
      !incrementalEnd &&
      !incrementalError
    ) {
      loadNext();
    }
  }, [view, items.length, nextPage, pending, incrementalEnd, incrementalError, loadNext]);

  useEffect(() => {
    if (view !== "infinite" || incrementalEnd || !sentinelRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNext();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [incrementalEnd, items, loadNext, view]);

  const changeUrl = (updates, clearKeys = []) => {
    const params = new URLSearchParams(searchParams);
    clearKeys.forEach((key) => params.delete(key));
    Object.entries(updates).forEach(([key, value]) => setOptional(params, key, String(value)));
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleCategoryQuickFilter = (categoryValue) => {
    const params = new URLSearchParams(searchParams);
    const nextCat = categoryValue === activeCategory ? "" : categoryValue;
    if (nextCat) {
      params.set("mode", "advanced");
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
    params.delete("status");
    params.set("mode", draft.mode);
    setOptional(params, "q", draft.q.trim());
    setOptional(params, "sort", draft.sort);
    if (draft.mode === "advanced") {
      ["category", "minPrice", "maxPrice", "available"].forEach((key) =>
        setOptional(params, key, draft[key].trim()),
      );
    } else {
      ["category", "minPrice", "maxPrice", "available"].forEach((key) => params.delete(key));
    }
    params.set("page", "1");
    setSearchParams(params);
    setSearchEpoch((epoch) => epoch + 1);
  };

  const clearConditions = () => {
    setDraft({
      mode: "basic",
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      available: "",
      sort: "id_asc",
    });
    const params = new URLSearchParams();
    params.set("view", view);
    params.set("pageSize", pageSize);
    params.set("page", "1");
    setSearchParams(params);
    setSearchEpoch((epoch) => epoch + 1);
  };

  const handlePageSize = (value) => changeUrl({ pageSize: value });
  const handleView = (value) => changeUrl({ view: value });
  const handlePage = (value) => {
    const params = new URLSearchParams(searchParams);
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
  const shownDishes = view === "pages" ? pageData?.items || [] : items;
  const resultTotal = view === "pages" ? pageData?.total : incrementalTotal;
  const advanced = draft.mode === "advanced";

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
          {/* 1. Khung chuyển đổi 3 chế độ phân trang được đẩy lên trên cùng */}
          <div className="dish-results-toolbar">
            <div className="dish-view-group">
              <span className="dish-view-label">Chế độ hiển thị:</span>
              <div className="dish-view-switch" role="group" aria-label="Kiểu hiển thị phân trang">
                {[
                  ["pages", "Số trang"],
                  ["load-more", "Tải thêm"],
                  ["infinite", "Cuộn vô hạn"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={view === value}
                    className={view === value ? "is-active" : ""}
                    onClick={() => handleView(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
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
            <div className="dish-search-primary-fields">
              <div className="dish-form-field">
                <label htmlFor="admin-dish-search-mode">Kiểu tìm kiếm</label>
                <select
                  id="admin-dish-search-mode"
                  value={draft.mode}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, mode: event.target.value }))
                  }
                >
                  <option value="basic">Cơ bản</option>
                  <option value="advanced">Nâng cao</option>
                  <option value="fulltext">Toàn văn</option>
                  <option value="fuzzy">Gần đúng (fuzzy)</option>
                </select>
              </div>

              <div className="dish-form-field dish-form-field--query">
                <label htmlFor="admin-dish-search-query">Từ khóa</label>
                <input
                  id="admin-dish-search-query"
                  type="search"
                  value={draft.q}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, q: event.target.value }))
                  }
                  placeholder={
                    draft.mode === "fulltext"
                      ? "Tên món hoặc từ trong mô tả"
                      : "Tìm theo tên món (ví dụ: Phở, Bún chả...)"
                  }
                />
              </div>

              <div className="dish-form-field">
                <label htmlFor="admin-dish-search-sort">Sắp xếp</label>
                <select
                  id="admin-dish-search-sort"
                  value={draft.sort}
                  disabled={draft.mode === "fulltext" || draft.mode === "fuzzy"}
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

            {advanced && (
              <div className="dish-search-advanced-fields">
                <div className="dish-form-field">
                  <label htmlFor="admin-dish-search-category">Danh mục</label>
                  <select
                    id="admin-dish-search-category"
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, category: event.target.value }))
                    }
                  >
                    <option value="">Tất cả</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
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
              <div className="dish-search-help-row" aria-live="polite">
                <p>{searchModeDescriptions[draft.mode]}</p>
                {(draft.mode === "fulltext" || draft.mode === "fuzzy") && (
                  <p><strong>Xếp theo độ phù hợp.</strong></p>
                )}
              </div>
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

        {mode === "fuzzy" && (
          <p className="dish-search-note">
            Tìm gần đúng dùng độ tương đồng toàn tên món; ngưỡng là 0.3.
          </p>
        )}

        {/* Trạng thái Loading / Lỗi */}
        {view === "pages" && pageLoading && <LoadingSpinner />}
        {view === "pages" && !pageLoading && pageError && (
          <ErrorAlert error={pageError} onRetry={retryPage} />
        )}
        {view !== "pages" && incrementalError && (
          <div className="dish-load-error" role="alert">
            <span>{incrementalError.message || "Không thể tải danh sách món ăn."}</span>
            <button type="button" className="btn btn--outline" onClick={loadNext}>
              Thử lại
            </button>
          </div>
        )}
        {view !== "pages" && pending && items.length === 0 && <LoadingSpinner />}

        {/* Bảng quản trị món ăn */}
        {(view !== "pages" ? !(pending && items.length === 0) : !pageLoading && !pageError) && (
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
        {view === "pages" && !pageLoading && !pageError && pageData && pageCount > 0 && (
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

        {/* Chế độ Tải thêm (load-more) */}
        {view === "load-more" && (
          <div className="dish-load-more">
            {pending && <span>Đang tải...</span>}
            {incrementalEnd && <span>Đã hết món</span>}
            {!incrementalEnd && (
              <button type="button" className="btn btn--outline" onClick={loadNext} disabled={pending}>
                {incrementalError ? "Thử lại" : "Tải thêm"}
              </button>
            )}
          </div>
        )}

        {/* Chế độ Cuộn vô hạn (infinite) */}
        {view === "infinite" && (
          <>
            <div ref={sentinelRef} className="dish-scroll-sentinel" aria-hidden="true" />
            <div className="dish-load-more">
              {pending && <span>Đang tải...</span>}
              {incrementalEnd && <span>Đã hết món</span>}
              {!incrementalEnd && (
                <button type="button" className="btn btn--outline" onClick={loadNext} disabled={pending}>
                  {incrementalError ? "Thử lại" : "Tải thêm"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
