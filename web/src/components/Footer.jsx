import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid" style={{ gridTemplateColumns: "1.5fr 1fr 1fr" }}>
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/assets/img/logo-white.svg" alt="RESTORAN" />
            </div>
            <p className="footer__desc">
              Trải nghiệm ẩm thực tinh tế, kết hợp nguyên liệu thượng hạng cùng kỹ nghệ chế biến lâu đời. Ẩm thực truyền thống Việt Nam kết hợp phong cách Bistro đương đại.
            </p>
          </div>

          <div>
            <h4 className="footer__heading">Điều Hướng</h4>
            <ul className="footer__links">
              <li><Link to="/dishes">Thực Đơn Khách Hàng</Link></li>
              <li><Link to="/admin/dishes">Quản Trị Món Ăn</Link></li>
              <li><Link to="/admin/chefs">Quản Trị Đầu Bếp</Link></li>
              <li><Link to="/admin/ingredients">Quản Trị Nguyên Liệu</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Giờ Phục Vụ</h4>
            <ul className="footer__links">
              <li>Thứ 2 - Thứ 6: 10:00 - 22:00</li>
              <li>Thứ 7 - Chủ Nhật: 09:00 - 23:00</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 RESTORAN</span>
          <span>Tinh hoa ẩm thực</span>
        </div>
      </div>
    </footer>
  );
}
