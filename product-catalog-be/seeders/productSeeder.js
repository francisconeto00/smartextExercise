const { Product, Category } = require("../models");
const { faker } = require("@faker-js/faker");

async function seedProducts() {
  try {
    const categories = await Category.findAll();

    if (categories.length === 0) {
      console.error("No categories found. Seed categories first.");
      process.exit(1);
    }

    const products = [];

    for (let i = 0; i < 100; i++) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      products.push({
        title: faker.commerce.productName(),
        description: faker.lorem.sentences(4),
        price: parseFloat(faker.commerce.price()),
        categoryId: randomCategory.id,
      });
    }

    await Product.bulkCreate(products);
    console.log("Products seeded successfully.");
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

module.exports = seedProducts;
