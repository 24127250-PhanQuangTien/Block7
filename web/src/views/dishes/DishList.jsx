import { ArrowDown, ArrowRight, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { dishApi } from "../../apiClient";
import { ErrorAlert, LoadingSpinner } from "../../components/StateViews";

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

function DishCards({ dishes }) {
  return (
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
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImg;
                }}
              />
            </div>
            <div className="menu-item__info">
              <div className="menu-item__header">
                <Link to={`/dishes/${dish.id}`} className="menu-item__name">
                  {dish.name}
                </Link>
                <span className="menu-item__dots" />
                <span className="menu-item__price">{dish.price.toLocaleString("vi-VN")} đ</span>
              </div>
              {(dish.chef || dish.ingredients?.length > 0) && (
                <div className="dish-card-meta">
                  {dish.chef && <span>Bếp: {dish.chef.name}</span>}
                  {dish.ingredients?.length > 0 && (
                    <span>
                      Nguyên liệu: {dish.ingredients.slice(0, 3).map((item) => item.name).join(", ")}
                      {dish.ingredients.length > 3 ? "..." : ""}
                    </span>
                  )}
                </div>
              )}
              <div className="menu-item__tags">
                {dish.category && <span className="menu-item__tag">{dish.category}</span>}
                <span
                  className={`menu-item__tag ${
                    dish.available
                      ? "menu-item__tag--available"
                      : "menu-item__tag--unavailable"
                  }`}
                >
                  {dish.available ? "Đang phục vụ" : "Tạm hết"}
                </span>
                <Link to={`/dishes/${dish.id}`} className="menu-item__tag menu-item__tag--unit">
                  Xem Chi Tiết <ArrowRight className="ui-icon" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DishList() {
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
  const mode = appliedParams.get("mode") || "basic";
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
      available: appliedParams.get("available") || "",
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
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
    <>
      <section className="page-hero menu-hero" aria-labelledby="menu-hero-title">
        <picture className="page-hero__bg" aria-hidden="true">
          <source media="(max-width: 600px)" srcSet="/assets/img/menu-hero-800.webp" />
          <img
            src="/assets/img/menu-hero-1600.webp"
            width="1600"
            height="666"
            alt=""
            fetchpriority="high"
            decoding="async"
          />
        </picture>
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <p className="menu-hero__eyebrow">Thực đơn RESTORAN</p>
          <h1 id="menu-hero-title" className="page-hero__title">
            Hương vị Việt,
            <br />
            trọn vẹn từng món
          </h1>
          <p className="page-hero__description">
            Khám phá những món Việt quen thuộc, từ tô phở nóng đến gỏi cuốn thanh mát.
          </p>
          <a className="btn btn--primary" href="#thuc-don">
            Khám phá thực đơn <ArrowDown className="ui-icon" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="thuc-don" className="section menu-section">
        <div className="container">
          <div className="section-header">
            <span className="section-header__label">Tuyển Chọn Tinh Hoa</span>
            <h2 className="section-header__title">Hương Vị Đặc Sắc</h2>
            <div className="section-header__divider" />
            <p className="section-header__text">
              Mỗi món ăn bắt đầu từ những nguyên liệu tươi ngon nhất, chuẩn bị bởi kỹ nghệ ẩm thực gia truyền.
            </p>
          </div>

          <div className="dish-search-panel">
            <form className="dish-search-form" onSubmit={handleSubmit}>
              <div className="dish-search-primary-fields">
                <div className="dish-form-field">
                  <label htmlFor="dish-search-mode">Kiểu tìm kiếm</label>
                  <select
                    id="dish-search-mode"
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
                  <label htmlFor="dish-search-query">Từ khóa</label>
                  <input
                    id="dish-search-query"
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
                  <label htmlFor="dish-search-sort">Sắp xếp</label>
                  <select
                    id="dish-search-sort"
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
                  <label htmlFor="dish-page-size">Món mỗi trang</label>
                  <select
                    id="dish-page-size"
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
                    <label htmlFor="dish-search-category">Danh mục</label>
                    <select
                      id="dish-search-category"
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
                    <label htmlFor="dish-min-price">Giá từ</label>
                    <input
                      id="dish-min-price"
                      type="number"
                      min="0"
                      value={draft.minPrice}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, minPrice: event.target.value }))
                      }
                    />
                  </div>
                  <div className="dish-form-field">
                    <label htmlFor="dish-max-price">Đến giá</label>
                    <input
                      id="dish-max-price"
                      type="number"
                      min="0"
                      value={draft.maxPrice}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, maxPrice: event.target.value }))
                      }
                    />
                  </div>
                  <div className="dish-form-field">
                    <label htmlFor="dish-availability">Trạng thái</label>
                    <select
                      id="dish-availability"
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

              <div className="dish-search-actions">
                <button className="btn btn--primary" type="submit">
                  <Search className="ui-icon" aria-hidden="true" /> Tìm kiếm
                </button>
                <button className="btn btn--outline" type="button" onClick={clearConditions}>
                  <X className="ui-icon" aria-hidden="true" /> Xóa điều kiện
                </button>
              </div>
            </form>
            <div className="dish-search-help-row" aria-live="polite">
              <p>{searchModeDescriptions[draft.mode]}</p>
              {(draft.mode === "fulltext" || draft.mode === "fuzzy") && (
                <p>Xếp theo độ phù hợp.</p>
              )}
            </div>
          </div>

          {mode === "fuzzy" && (
            <p className="dish-search-note">
              Tìm gần đúng dùng độ tương đồng toàn tên món; ngưỡng là 0.3.
            </p>
          )}

          <div className="dish-results-toolbar">
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
            {resultTotal !== null && resultTotal !== undefined && (
              <span>{resultTotal.toLocaleString("vi-VN")} món phù hợp</span>
            )}
          </div>

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
          {!pageLoading && !pageError && resultTotal === 0 && (
            <div className="dish-empty-state">Không tìm thấy món ăn phù hợp với điều kiện đã chọn.</div>
          )}
          {shownDishes.length > 0 &&
            (view !== "pages" || (!pageLoading && !pageError)) && (
              <DishCards dishes={shownDishes} />
            )}

          {view === "pages" && !pageLoading && !pageError && pageData && pageCount > 0 && (
            <nav className="dish-pagination" aria-label="Phân trang món ăn">
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
    </>
  );
}
