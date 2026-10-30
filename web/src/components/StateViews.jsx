import React from "react";
import { ArrowLeft, CircleAlert, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

// Skeleton theo bố cục nội dung, giữ thông báo tải cho trình đọc màn hình.
export function LoadingSkeleton({ variant = "form", rows = 6, columns = 5, message = "Đang tải dữ liệu…" })
{
  return (
    <div className={`spa-loading loading-skeleton loading-skeleton--${variant}`} role="status" aria-live="polite">
      <span className="skeleton-status-text">{message}</span>
      {variant === "table" ? (
        <div className="skeleton-table-scroll" aria-hidden="true">
          <table className="data-table skeleton-table">
            <thead>
              <tr>
                {Array.from({ length: columns }, (_, index) => (
                  <th key={index}><span className="skeleton-block skeleton-line" /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, row) => (
                <tr key={row}>
                  {Array.from({ length: columns }, (_, column) => (
                    <td key={column}><span className="skeleton-block skeleton-line" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="skeleton-panel" aria-hidden="true">
          {variant === "detail" && <div className="skeleton-block skeleton-detail-image" />}
          <div className="skeleton-panel-content">
            <span className="skeleton-block skeleton-title" />
            {Array.from({ length: variant === "confirmation" ? 3 : 6 }, (_, index) => (
              <div className="skeleton-field" key={index}>
                <span className="skeleton-block skeleton-line skeleton-line--short" />
                <span className={`skeleton-block ${variant === "form" ? "skeleton-input" : "skeleton-line"}`} />
              </div>
            ))}
            <div className="skeleton-actions">
              <span className="skeleton-block skeleton-button" />
              <span className="skeleton-block skeleton-button" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DishListSkeleton({ count = 10, message = "Đang tải danh sách món ăn…" })
{
  return (
    <div className="dish-list-skeleton" role="status" aria-live="polite">
      <span className="skeleton-status-text">{message}</span>
      <div className="menu-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div className="menu-item menu-item--skeleton" key={index}>
            <div className="menu-item__image skeleton-block" />
            <div className="menu-item__info">
              <div className="menu-item__header">
                <span className="skeleton-block skeleton-title" />
                <span className="skeleton-block skeleton-price" />
              </div>
              <span className="skeleton-block skeleton-line" />
              <span className="skeleton-block skeleton-line skeleton-line--short" />
              <div className="menu-item__tags">
                <span className="skeleton-block skeleton-tag" />
                <span className="skeleton-block skeleton-tag" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Trạng thái Lỗi có nút Thử lại (Retry)
export function ErrorAlert({ error, onRetry }) {
  const message =
    typeof error === "string"
      ? error
      : error?.message || "Không thể tải được thông tin. Vui lòng thử lại.";

  return (
    <div className="spa-error-banner">
      <h3 className="spa-error-title"><CircleAlert className="ui-icon" aria-hidden="true" /> Không thể tải dữ liệu</h3>
      <p className="spa-error-message">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn--retry">
          <RotateCcw className="ui-icon" aria-hidden="true" /> Thử Lại
        </button>
      )}
    </div>
  );
}

// 3. Trạng thái Không tìm thấy món / trang
export function NotFoundCard({
  code = null,
  title = "Không Tìm Thấy Thông Tin",
  message = "Trang hoặc món ăn bạn đang tìm kiếm không tồn tại hoặc đã ngừng phục vụ.",
  backUrl = "/dishes",
  backText = "Về Thực Đơn Nhà Hàng",
}) {
  return (
    <div className="error-card" style={{ margin: "40px auto" }}>
      {code ? <div className="error-badge">{code}</div> : null}
      <h2 className="error-title">{title}</h2>
      <p className="error-desc">{message}</p>
      <div className="error-actions">
        <Link to={backUrl} className="btn btn--primary">
          <ArrowLeft className="ui-icon" aria-hidden="true" />
          {backText}
        </Link>
        <Link to="/admin/dishes" className="btn btn--ghost">
          Về Cổng Quản Trị
        </Link>
      </div>
    </div>
  );
}

// 4. Trạng thái Danh sách rỗng (empty)
export function EmptyState({
  title = "Không tìm thấy món ăn nào",
  message = "Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn phân loại khác.",
  actionLink = "/dishes",
  actionText = "Xem Tất Cả Món Ăn",
}) {
  return (
    <div className="empty-state" style={{ textAlign: "center", padding: "60px 0" }}>
      <h3 style={{ fontSize: "1.8rem", marginBottom: "12px", fontFamily: "'Cormorant Garamond', serif" }}>
        {title}
      </h3>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>{message}</p>
      {actionLink && (
        <Link to={actionLink} className="btn btn--primary">
          {actionText}
        </Link>
      )}
    </div>
  );
}
