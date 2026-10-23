require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fiftyIngredients = [
  // Gia vị (20)
  { name: "Hành tím khô", quantity: 20, unit: "kg", category: "Gia vị" },
  { name: "Tỏi cô đơn Lý Sơn", quantity: 15, unit: "kg", category: "Gia vị" },
  { name: "Gừng non tươi", quantity: 10, unit: "kg", category: "Gia vị" },
  { name: "Sả cây", quantity: 25, unit: "bó", category: "Gia vị" },
  { name: "Ớt hiểm đỏ", quantity: 8, unit: "kg", category: "Gia vị" },
  { name: "Ớt sừng trâu", quantity: 12, unit: "kg", category: "Gia vị" },
  { name: "Muối tinh sấy", quantity: 50, unit: "kg", category: "Gia vị" },
  { name: "Đường cát trắng", quantity: 60, unit: "kg", category: "Gia vị" },
  { name: "Đường thốt nốt", quantity: 15, unit: "kg", category: "Gia vị" },
  { name: "Hạt nêm thịt thăn", quantity: 30, unit: "gói", category: "Gia vị" },
  { name: "Bột ngọt Ajinomoto", quantity: 25, unit: "kg", category: "Gia vị" },
  { name: "Tiêu sọ xay nhuyễn", quantity: 5000, unit: "gam", category: "Gia vị" },
  { name: "Tiêu xanh tươi", quantity: 4000, unit: "gam", category: "Gia vị" },
  { name: "Dầu ăn thực vật", quantity: 40, unit: "lít", category: "Gia vị" },
  { name: "Dầu hào cao cấp", quantity: 20, unit: "chai", category: "Gia vị" },
  { name: "Dầu mè thơm", quantity: 15, unit: "chai", category: "Gia vị" },
  { name: "Nước tương đậu nành", quantity: 25, unit: "chai", category: "Gia vị" },
  { name: "Giấm gạo thanh", quantity: 20, unit: "lít", category: "Gia vị" },
  { name: "Sa tế tôm cay", quantity: 18, unit: "hũ", category: "Gia vị" },
  { name: "Bột ngũ vị hương", quantity: 50, unit: "gói", category: "Gia vị" },

  // Rau củ & Nấm (15)
  { name: "Hành lá tươi", quantity: 30, unit: "bó", category: "Rau" },
  { name: "Ngò rí (rau mùi)", quantity: 20, unit: "bó", category: "Rau" },
  { name: "Rau muống non", quantity: 35, unit: "bó", category: "Rau" },
  { name: "Cải thìa ngọt", quantity: 25, unit: "kg", category: "Rau" },
  { name: "Cải ngọt tươi", quantity: 20, unit: "kg", category: "Rau" },
  { name: "Bắp cải trắng", quantity: 30, unit: "bắp", category: "Rau" },
  { name: "Giá đỗ sạch", quantity: 40, unit: "kg", category: "Rau" },
  { name: "Dưa leo baby", quantity: 25, unit: "kg", category: "Rau" },
  { name: "Cà chua Đà Lạt", quantity: 30, unit: "kg", category: "Rau" },
  { name: "Cà rốt tươi", quantity: 25, unit: "kg", category: "Rau" },
  { name: "Khoai tây Đà Lạt", quantity: 35, unit: "kg", category: "Rau" },
  { name: "Nấm rơm tươi", quantity: 15, unit: "kg", category: "Rau" },
  { name: "Nấm đùi gà", quantity: 12, unit: "kg", category: "Rau" },
  { name: "Nấm hương khô", quantity: 3000, unit: "gam", category: "Rau" },
  { name: "Chanh tươi không hạt", quantity: 15, unit: "kg", category: "Rau" },

  // Bún & Tinh bột (8)
  { name: "Bún tươi sợi nhỏ", quantity: 45, unit: "kg", category: "Bún" },
  { name: "Bún khô Sa Đéc", quantity: 30, unit: "gói", category: "Bún" },
  { name: "Hủ tiếu dai", quantity: 25, unit: "kg", category: "Bún" },
  { name: "Mì trứng sợi tròn", quantity: 35, unit: "gói", category: "Bún" },
  { name: "Miến dong cao cấp", quantity: 25, unit: "gói", category: "Bún" },
  { name: "Bánh tráng phơi sương", quantity: 50, unit: "xấp", category: "Bún" },
  { name: "Bột gạo tẻ lọc", quantity: 20, unit: "kg", category: "Bún" },
  { name: "Bột chiên giòn", quantity: 30, unit: "gói", category: "Bún" },

  // Thịt (7)
  { name: "Thịt ba chỉ heo", quantity: 25, unit: "kg", category: "Thịt" },
  { name: "Thịt nạc vai heo", quantity: 20, unit: "kg", category: "Thịt" },
  { name: "Thịt bắp bò hoa", quantity: 18, unit: "kg", category: "Thịt" },
  { name: "Ức gà tươi phi lê", quantity: 22, unit: "kg", category: "Thịt" },
  { name: "Đùi gà góc tư", quantity: 30, unit: "kg", category: "Thịt" },
  { name: "Giò sống nguyên chất", quantity: 15, unit: "kg", category: "Thịt" },
  { name: "Thịt bò xay", quantity: 16, unit: "kg", category: "Thịt" },
];

async function seedFiftyIngredients() {
  console.log("==> Đang cập nhật danh mục cho nguyên liệu cũ và thêm 50 nguyên liệu mới...");

  // Cập nhật danh mục cho nguyên liệu cũ nếu có
  const existingList = await prisma.ingredient.findMany();
  for (const item of existingList) {
    let cat = item.category || "Khác";
    const n = item.name.toLowerCase();
    if (n.includes("phở") || n.includes("bún") || n.includes("gạo") || n.includes("mì") || n.includes("miến")) {
      cat = "Bún";
    } else if (n.includes("bò") || n.includes("heo") || n.includes("thịt") || n.includes("sườn") || n.includes("gà")) {
      cat = "Thịt";
    } else if (n.includes("mắm") || n.includes("muối") || n.includes("đường") || n.includes("tiêu") || n.includes("dầu") || n.includes("gia vị")) {
      cat = "Gia vị";
    } else if (n.includes("rau") || n.includes("ngò") || n.includes("sen") || n.includes("cải") || n.includes("nấm") || n.includes("giá")) {
      cat = "Rau";
    } else if (n.includes("tôm") || n.includes("cua") || n.includes("mực") || n.includes("cá")) {
      cat = "Hải sản";
    }

    if (item.category !== cat) {
      await prisma.ingredient.update({
        where: { id: item.id },
        data: { category: cat },
      });
    }
  }

  // Thêm 50 nguyên liệu mới
  let addedCount = 0;
  for (const ing of fiftyIngredients) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: { equals: ing.name, mode: "insensitive" } },
    });

    if (!existing) {
      await prisma.ingredient.create({
        data: ing,
      });
      addedCount++;
    } else {
      // Cập nhật category nếu chưa có
      await prisma.ingredient.update({
        where: { id: existing.id },
        data: { category: ing.category },
      });
    }
  }

  const total = await prisma.ingredient.count();
  console.log(`==> Hoàn tất! Đã thêm mới ${addedCount} nguyên liệu. Tổng nguyên liệu hiện có trong database: ${total}`);
}

seedFiftyIngredients()
  .catch((e) => {
    console.error("Lỗi khi seed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
