import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { chefApi } from "../../../apiClient";
import { LoadingSpinner, ErrorAlert } from "../../../components/StateViews";

export default function AdminChefList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQ, setSearchQ] = useState(qParam);

  const fetchChefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chefApi.list({ q: qParam });
      setChefs(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQ(qParam);
    fetchChefs();
  }, [qParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchQ.trim()) newParams.set("q", searchQ.trim());
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQ("");
    setSearchParams(new URLSearchParams());
  };

  return (
    <section className="section" style={{ paddingTop: "120px" }}>
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-header__title">Quản Trị Đội Ngũ Đầu Bếp</h1>
            <p className="admin-header__subtitle">
              Danh sách các bếp trưởng và chuyên gia ẩm thực của nhà hàng.
            </p>
          </div>
          <div>
            <Link to="/admin/chefs/new" className="btn btn--primary">
              <Plus className="ui-icon" aria-hidden="true" /> Thêm Đầu Bếp
            </Link>
          </div>
        </div>

        {/* Thanh Tìm Kiếm Đầu Bếp */}
        <div className="admin-filter-card">
          <form onSubmit={handleSearchSubmit} className="admin-filter-form">
            <div className="admin-filter-field admin-filter-field--search">
              <label className="admin-filter-label" htmlFor="filter-q">
                Tìm kiếm đầu bếp
              </label>
              <input
                type="text"
                id="filter-q"
                name="q"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm theo tên đầu bếp hoặc chuyên môn..."
                className="admin-filter-input"
              />
            </div>
            <div className="admin-filter-buttons">
              <button type="submit" className="admin-filter-btn btn--primary">
                <Search className="ui-icon" aria-hidden="true" /> Tìm Kiếm
              </button>
              {qParam && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="admin-filter-btn btn--ghost"
                >
                  <X className="ui-icon" aria-hidden="true" /> Xóa Tìm Kiếm
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trạng thái Loading */}
        {loading && <LoadingSpinner />}

        {/* Trạng thái Lỗi */}
        {!loading && error && <ErrorAlert error={error} onRetry={fetchChefs} />}

        {/* Bảng dữ liệu đầu bếp */}
        {!loading && !error && (
          <div className="admin-table-card">
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>ID</th>
                    <th>Họ và Tên Đầu Bếp</th>
                    <th>Sở Trường / Chuyên Môn</th>
                    <th>Ngày Tham Gia</th>
                    <th style={{ width: "180px", textAlign: "center" }}>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {chefs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                        Chưa có thông tin đầu bếp nào phù hợp với tìm kiếm.
                        {qParam && (
                          <div style={{ marginTop: "12px" }}>
                            <button
                              type="button"
                              onClick={handleClearSearch}
                              className="btn btn--ghost"
                            >
                              Xem tất cả đầu bếp
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    chefs.map((chef) => (
                      <tr key={chef.id}>
                        <td>
                          <strong>#{chef.id}</strong>
                        </td>
                        <td>
                          <strong style={{ color: "var(--charcoal)", fontSize: "1.05rem" }}>
                            {chef.name}
                          </strong>
                        </td>
                        <td>{chef.specialty}</td>
                        <td>{new Date(chef.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="action-cell">
                          <Link
                            to={`/admin/chefs/${chef.id}/edit`}
                            className="btn-xs btn-xs-edit"
                          >
                            <Pencil className="ui-icon" aria-hidden="true" /> Sửa
                          </Link>
                          <Link
                            to={`/admin/chefs/${chef.id}/delete`}
                            className="btn-xs btn-xs-delete"
                          >
                            <Trash2 className="ui-icon" aria-hidden="true" /> Xóa
                          </Link>
                        </td>
                      </tr>
                    ))
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
