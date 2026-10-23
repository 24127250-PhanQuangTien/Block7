import React from "react";
import { Link } from "react-router-dom";

// 1. Trạng thái Đang tải (loading) - Màn hình xoay trang nhã, không thông báo kỹ thuật backend
export function LoadingSpinner({ message = "" }) {
  return (
    <div className="spa-loading" style={{ padding: "60px 20px" }}>
      <div className="spa-spinner"></div>
      {message ? <p className="spa-loading-text">{message}</p> : null}
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
      <h3 className="spa-error-title">Không thể tải dữ liệu</h3>
      <p className="spa-error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn--retry">
          Thử Lại
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
  backText = "← Về Thực Đơn Nhà Hàng",
}) {
  return (
    <div className="error-card" style={{ margin: "40px auto" }}>
      {code ? <div className="error-badge">{code}</div> : null}
      <h2 className="error-title">{title}</h2>
      <p className="error-desc">{message}</p>
      <div className="error-actions">
        <Link to={backUrl} className="btn btn--primary">
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
