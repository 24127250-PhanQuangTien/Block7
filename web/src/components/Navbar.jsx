import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng menu mobile khi chuyển route
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${isAdmin ? "navbar--admin" : ""} ${isScrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        {isAdmin ? (
          /* ==================== PHÍA QUẢN TRỊ (ADMIN) ==================== */
          <>
            <Link to="/admin/dishes" className="navbar__logo">
              <img src="/assets/img/logo-white.svg" alt="RESTORAN ADMIN" />
            </Link>

            <div className={`navbar__menu ${menuOpen ? "open" : ""}`}>
              <NavLink
                to="/admin/dishes"
                className={({ isActive }) =>
                  `navbar__link ${location.pathname.startsWith("/admin/dishes") ? "navbar__link--active" : ""}`
                }
              >
                Món Ăn
              </NavLink>

              <NavLink
                to="/admin/chefs"
                className={({ isActive }) =>
                  `navbar__link ${location.pathname.startsWith("/admin/chefs") ? "navbar__link--active" : ""}`
                }
              >
                Đầu Bếp
              </NavLink>

              <NavLink
                to="/admin/ingredients"
                className={({ isActive }) =>
                  `navbar__link ${location.pathname.startsWith("/admin/ingredients") ? "navbar__link--active" : ""}`
                }
              >
                Nguyên Liệu
              </NavLink>

              <Link to="/dishes" className="navbar__link navbar__link--client">
                Xem Trang Khách →
              </Link>
            </div>
          </>
        ) : (
          /* ==================== PHÍA THỰC KHÁCH (CLIENT) ==================== */
          <>
            <Link to="/dishes" className="navbar__logo">
              <img src="/assets/img/logo-white.svg" alt="RESTORAN" />
            </Link>

            <div className={`navbar__menu ${menuOpen ? "open" : ""}`}>
              <NavLink
                to="/dishes"
                end
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
              >
                Thực Đơn
              </NavLink>

              <Link to="/admin/dishes" className="navbar__link navbar__link--admin">
                Cổng Quản Trị
              </Link>
            </div>
          </>
        )}

        <button
          className={`navbar__toggle ${menuOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
