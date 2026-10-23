import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      {/* Page Hero Section */}
      <section className="page-hero">
        <div className="page-hero__bg">
          <img src="/assets/img/menu-bg.svg" alt="Lỗi 404" />
        </div>
        <div className="page-hero__overlay"></div>
        <div className="container page-hero__content">
          <h1 className="page-hero__title">404 - Không Tìm Thấy</h1>
          <p className="page-hero__breadcrumb">
            <Link to="/dishes">Trang Chủ</Link> &nbsp;/&nbsp; Lỗi
          </p>
        </div>
      </section>

      {/* Error Section */}
      <section className="section">
        <div className="container">
          <div className="error-card">
            <div className="error-badge">404</div>
            <h2 className="error-title">Không Tìm Thấy Trang</h2>
            <p className="error-desc">
              Trang hoặc món ăn bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
            </p>
            <div className="error-actions">
              <Link to="/dishes" className="btn btn--primary">
                <ArrowLeft className="ui-icon" aria-hidden="true" /> Về Thực Đơn Nhà Hàng
              </Link>
              <Link to="/admin/dishes" className="btn btn--ghost">
                Về Cổng Quản Trị
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
