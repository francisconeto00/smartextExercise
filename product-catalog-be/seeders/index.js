const seedCategories = require("./categorySeeder");
const seedProducts = require("./productSeeder");

async function seedAll() {
  try {
    await seedCategories();
    await seedProducts();
    console.log("All seeders ran successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedAll();
