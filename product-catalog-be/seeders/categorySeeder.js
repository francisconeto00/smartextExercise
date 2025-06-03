const { Category } = require("../models");
const { faker } = require("@faker-js/faker");

async function seedCategories() {
  try {
    const categories = [];
    const uniqueTitles = new Set();

    while (uniqueTitles.size < 5) {
      const title = faker.commerce.department();
      if (!uniqueTitles.has(title)) {
        uniqueTitles.add(title);
        categories.push({
          title,
          description: faker.lorem.sentences(2),
        });
      }
    }

    await Category.bulkCreate(categories);
    console.log("Categories seeded successfully.");
  } catch (error) {
    console.error("Error seeding categories:", error);
    throw error;
  }
}

module.exports = seedCategories;
