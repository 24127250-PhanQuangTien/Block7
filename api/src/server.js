require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 REST API Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🌐 CORS được cấu hình cho origin: ${process.env.CLIENT_ORIGIN || "http://localhost:5173"}`);
  console.log(`📖 Endpoint Món ăn:      http://localhost:${PORT}/api/dishes`);
  console.log(`👨‍🍳 Endpoint Đầu bếp:     http://localhost:${PORT}/api/chefs`);
  console.log(`🥕 Endpoint Nguyên liệu: http://localhost:${PORT}/api/ingredients`);
});

// Xử lý tắt server êm dịu (Graceful shutdown)
process.on("SIGINT", () => {
  console.log("\nĐang tắt máy chủ API...");
  server.close(() => {
    console.log("Máy chủ đã dừng an toàn.");
    process.exit(0);
  });
});
