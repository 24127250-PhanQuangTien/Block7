import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Views cho món ăn
import DishList from "./views/dishes/DishList";
import DishDetail from "./views/dishes/DishDetail";
import AdminDishList from "./views/admin/dishes/AdminDishList";
import AdminDishDetail from "./views/admin/dishes/AdminDishDetail";
import DishForm from "./views/admin/dishes/DishForm";
import DishDelete from "./views/admin/dishes/DishDelete";

// Views cho đầu bếp
import AdminChefList from "./views/admin/chefs/AdminChefList";
import ChefForm from "./views/admin/chefs/ChefForm";
import ChefDelete from "./views/admin/chefs/ChefDelete";

// Views cho nguyên liệu
import AdminIngredientList from "./views/admin/ingredients/AdminIngredientList";
import IngredientForm from "./views/admin/ingredients/IngredientForm";
import IngredientDelete from "./views/admin/ingredients/IngredientDelete";

// Trang 404
import NotFound from "./views/NotFound";

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Trang chủ tự động chuyển về /dishes */}
          <Route path="/" element={<Navigate to="/dishes" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dishes" replace />} />

          {/* Món ăn (User & Admin) */}
          <Route path="/dishes" element={<DishList />} />
          <Route path="/dishes/:id" element={<DishDetail />} />
          <Route path="/admin/dishes" element={<AdminDishList />} />
          <Route path="/admin/dishes/new" element={<DishForm isEdit={false} />} />
          <Route path="/admin/dishes/:id" element={<AdminDishDetail />} />
          <Route path="/admin/dishes/:id/edit" element={<DishForm isEdit={true} />} />
          <Route path="/admin/dishes/:id/delete" element={<DishDelete />} />

          {/* Đầu bếp */}
          <Route path="/admin/chefs" element={<AdminChefList />} />
          <Route path="/admin/chefs/new" element={<ChefForm isEdit={false} />} />
          <Route path="/admin/chefs/:id/edit" element={<ChefForm isEdit={true} />} />
          <Route path="/admin/chefs/:id/delete" element={<ChefDelete />} />

          {/* Nguyên liệu */}
          <Route path="/admin/ingredients" element={<AdminIngredientList />} />
          <Route path="/admin/ingredients/new" element={<IngredientForm isEdit={false} />} />
          <Route path="/admin/ingredients/:id/edit" element={<IngredientForm isEdit={true} />} />
          <Route path="/admin/ingredients/:id/delete" element={<IngredientDelete />} />

          {/* Trang không tìm thấy (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
