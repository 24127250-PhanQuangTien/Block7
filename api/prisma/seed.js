require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fiftyExtraIngredients = [
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

async function main() {
  console.log("==> Bắt đầu nạp dữ liệu mẫu (Seed Database)...");

  // Xóa dữ liệu cũ theo thứ tự quan hệ
  await prisma.dish.deleteMany({});
  await prisma.chef.deleteMany({});
  await prisma.ingredient.deleteMany({});

  // 1. Seed Đầu bếp (Chefs)
  const chefDang = await prisma.chef.create({
    data: {
      name: "Nguyễn Hải Đăng",
      specialty: "Bếp trưởng ẩm thực truyền thống Bắc Bộ, 15 năm kinh nghiệm",
    },
  });

  const chefLan = await prisma.chef.create({
    data: {
      name: "Trần Thị Mai Lan",
      specialty: "Chuyên gia bánh ngọt và món tráng miệng cung đình",
    },
  });

  const chefPhuc = await prisma.chef.create({
    data: {
      name: "Lê Hoàng Phúc",
      specialty: "Bếp phó phụ trách các món nướng than hoa và hải sản",
    },
  });

  // 2. Seed Nguyên liệu (Ingredients)
  const ingPho = await prisma.ingredient.create({ data: { name: "Bánh phở tươi", quantity: 25, unit: "kg", category: "Bún" } });
  const ingBo = await prisma.ingredient.create({ data: { name: "Thịt thăn bò Úc", quantity: 15, unit: "kg", category: "Thịt" } });
  const ingSuon = await prisma.ingredient.create({ data: { name: "Sườn heo non", quantity: 20, unit: "kg", category: "Thịt" } });
  const ingGao = await prisma.ingredient.create({ data: { name: "Gạo tấm thơm", quantity: 50, unit: "kg", category: "Bún" } });
  const ingTom = await prisma.ingredient.create({ data: { name: "Tôm sú tươi", quantity: 12, unit: "kg", category: "Hải sản" } });
  const ingSen = await prisma.ingredient.create({ data: { name: "Hạt sen Huế", quantity: 5000, unit: "gam", category: "Rau" } });
  const ingMam = await prisma.ingredient.create({ data: { name: "Nước mắm cá cơm", quantity: 30, unit: "lít", category: "Gia vị" } });
  const ingRau = await prisma.ingredient.create({ data: { name: "Rau quế và rau thơm các loại", quantity: 40, unit: "bó", category: "Rau" } });

  for (const item of fiftyExtraIngredients) {
    await prisma.ingredient.create({ data: item });
  }

  // 3. Seed Món ăn kèm Đầu bếp và Nguyên liệu (Dishes with Chef & Ingredients)
  await prisma.dish.create({
    data: {
      name: "Phở Bò Tái Nạm",
      description: "Bò tái mềm kết hợp nạm giòn thơm cùng nước dùng ninh xương 12 tiếng.",
      price: 55000,
      category: "Món Nước",
      available: true,
      imageUrl: "/assets/img/dishes/pho-bo.jpg",
      chefId: chefDang.id,
      ingredients: { connect: [{ id: ingPho.id }, { id: ingBo.id }, { id: ingMam.id }, { id: ingRau.id }] },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Bún Chả Hà Nội",
      description: "Chả nướng than hoa thơm lừng ăn kèm bún tươi, chả viên và nước mắm chua ngọt.",
      price: 50000,
      category: "Món Khô",
      available: true,
      imageUrl: "/assets/img/dishes/bun-cha.jpg",
      chefId: chefDang.id,
      ingredients: { connect: [{ id: ingSuon.id }, { id: ingMam.id }, { id: ingRau.id }] },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Cơm Tấm Sườn Bì Chả",
      description: "Sườn nướng mật ong đậm đà kết hợp bì thính, chả trứng hấp thơm ngậy.",
      price: 45000,
      category: "Món Cơm",
      available: true,
      imageUrl: "/assets/img/dishes/com-tam.jpg",
      chefId: chefPhuc.id,
      ingredients: { connect: [{ id: ingGao.id }, { id: ingSuon.id }, { id: ingMam.id }] },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Gỏi Cuốn Tôm Thịt",
      description: "Tôm tươi hấp, thịt ba chỉ luộc, rau thơm cuộn bánh tráng chấm tương đậu phộng.",
      price: 35000,
      category: "Khai Vị",
      available: true,
      imageUrl: "/assets/img/dishes/goi-cuon.jpg",
      chefId: chefPhuc.id,
      ingredients: { connect: [{ id: ingTom.id }, { id: ingRau.id }, { id: ingMam.id }] },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Chè Hạt Sen Long Nhãn",
      description: "Vị ngọt thanh tao từ long nhãn Hưng Yên quyện cùng hạt sen bùi bùi giải nhiệt.",
      price: 30000,
      category: "Tráng Miệng",
      available: true,
      imageUrl: "/assets/img/dishes/che-hat-sen.jpg",
      chefId: chefLan.id,
      ingredients: { connect: [{ id: ingSen.id }] },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Lẩu Cua Đồng Hải Sản",
      description: "Riêu cua đồng tươi ngọt đậm vị đồng quê, ăn kèm hải sản tươi sống và rau muống.",
      price: 250000,
      category: "Món Lẩu",
      available: false,
      imageUrl: "/assets/img/dishes/lau-cua-dong.jpg",
      chefId: chefPhuc.id,
      ingredients: { connect: [{ id: ingTom.id }, { id: ingRau.id }] },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Mì Quảng Tôm Thịt",
      description: "Món ăn đặc sản mang đậm phong vị ẩm thực miền Trung truyền thống.",
      price: 45000,
      category: "Món Nước",
      available: true,
      imageUrl: "/assets/img/dishes/mi-quang.jpg",
      chefId: chefDang.id,
      ingredients: { connect: [{ id: ingTom.id }, { id: ingSuon.id }, { id: ingRau.id }] },
    },
  });

  console.log(`==> Seed thành công: Đầu bếp, 58 Nguyên liệu và Món ăn đã được liên kết quan hệ chặt chẽ!`);
}

main()
  .catch((e) => {
    console.error("Seed thất bại.", { type: e.name, code: /^P\d{4}$/.test(e.code) ? e.code : undefined });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
