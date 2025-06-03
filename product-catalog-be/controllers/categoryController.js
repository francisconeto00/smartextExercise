const { Category } = require("../models");
const logger = require("../utils/logger");
const url = require("url");
const { Op } = require("sequelize");

async function createCategory(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { title, description } = JSON.parse(body);
      if (!title) {
        res.writeHead(400);
        return res.end("Missing title");
      }
      const category = await Category.create({ title, description });
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(category));
    } catch (err) {
      res.writeHead(500);
      res.end(err.message);
    }
  });
}

async function updateCategory(req, res, id) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { title, description } = JSON.parse(body);
      const category = await Category.findByPk(id);
      if (!category) {
        res.writeHead(404);
        return res.end("Not found");
      }

      category.title = title || category.title;
      category.description = description || category.description;
      await category.save();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(category));
    } catch (err) {
      res.writeHead(500);
      res.end(err.message);
    }
  });
}

async function deleteCategory(req, res, id) {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      res.writeHead(404);
      return res.end("Not found");
    }

    await category.destroy();
    res.writeHead(204);
    res.end();
  } catch (err) {
    res.writeHead(500);
    res.end(err.message);
  }
}

async function getCategories(req, res) {
  try {
    const { query } = url.parse(req.url, true);
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 12;
    const offset = (page - 1) * pageSize;
    if (parseInt(query.all) == true) {
      (offset = null), (pageSize = null), (page = null);
    }
    logger.info(`getCategories called with page=${page} pageSize=${pageSize}`);

    const filters = {};
    if (query.search) {
      filters[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
      logger.info(`Filtering by search=${query.search}`);
    }
    const { rows: data, count: totalItems } = await Category.findAndCountAll({
      where: filters,
      offset,
      limit: pageSize,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data,
        pagination: {
          page,
          pageSize,
          totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch categories" }));
  }
}
module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
