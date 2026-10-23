const { PrismaClient } = require("@prisma/client");

// Khởi tạo instance PrismaClient duy nhất (Singleton)
const prisma = new PrismaClient();

module.exports = prisma;
