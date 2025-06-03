const { Product, Category } = require("../models");
const logger = require("../utils/logger");
const url = require("url");
const { Op } = require("sequelize");

async function getAllProducts(req, res) {
  try {
    const { query } = url.parse(req.url, true);
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    logger.info(`getAllProducts called with page=${page} pageSize=${pageSize}`);

    const filters = {};
    if (query.categoryId) {
      const categoryIds = query.categoryId
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      if (categoryIds.length > 0) {
        filters.categoryId = { [Op.in]: categoryIds };
        logger.info(`Filtering by categoryIds=${categoryIds}`);
      }
    }
    if (query.search) {
      filters[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
      logger.info(`Filtering by search=${query.search}`);
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: filters,
      limit,
      offset,
      include: { model: Category, as: "category", attributes: ["id", "title"] },
    });

    const totalPages = Math.ceil(count / pageSize);
    logger.info(`Found ${count} products`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
  } catch (err) {
    res.writeHead(500);
    res.end(err.message);
  }
}

async function getProductById(req, res, id) {
  try {
    logger.info(`getProductById called with id=${id}`);
    const product = await Product.findByPk(id, {
      include: { model: Category, as: "category", attributes: ["id", "title"] },
    });
    if (!product) {
      logger.warn(`getProductById: product with id=${id} not found`);
      res.writeHead(404);
      return res.end("Not found");
    }

    logger.info(`getProductById: product with id=${id} retrieved successfully`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(product));
  } catch (err) {
    res.writeHead(500);
    res.end(err.message);
  }
}

async function createProduct(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      logger.info(`createProduct called with body: ${body}`);
      const { title, description, price, categoryId } = JSON.parse(body);
      if (!title) {
        logger.warn("createProduct failed: Missing title");
        res.writeHead(400);
        return res.end("Missing title");
      }

      const product = await Product.create({
        title,
        description,
        price,
        categoryId,
      });
      logger.info(`Product created with id: ${product.id}`);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    } catch (err) {
      res.writeHead(500);
      res.end(err.message);
    }
  });
}

async function updateProduct(req, res, id) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      logger.info(`updateProduct called with id=${id} and body=${body}`);
      const { title, description, price, categoryId } = JSON.parse(body);
      const product = await Product.findByPk(id);
      if (!product) {
        logger.warn(`updateProduct: product with id=${id} not found`);
        res.writeHead(404);
        return res.end("Not found");
      }

      product.title = title || product.title;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.categoryId =
        categoryId !== undefined ? categoryId : product.categoryId;

      await product.save();
      logger.info(`Product with id=${id} updated successfully`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    } catch (err) {
      logger.error(`updateProduct error for id=${id}: ${err.message}`);
      res.writeHead(500);
      res.end(err.message);
    }
  });
}

async function deleteProducts(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      logger.info(`deleteProducts called with body=${body}`);
      const { ids } = JSON.parse(body);
      if (!Array.isArray(ids) || ids.length === 0) {
        logger.warn("deleteProducts failed: Missing or invalid ids");
        res.writeHead(400);
        return res.end("Missing or invalid ids");
      }

      const deletedCount = await Product.destroy({ where: { id: ids } });

      if (deletedCount === 0) {
        logger.warn(`deleteProducts: No products deleted for ids=${ids}`);
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "No products were deleted" }));
      }
      logger.info(
        `Products deleted successfully: count=${deletedCount}, ids=${ids}`
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Products deleted successfully",
          deletedCount,
          ids,
        })
      );
    } catch (err) {
      logger.error(`deleteProducts error: ${err.message}`);
      res.writeHead(500);
      res.end(err.message);
    }
  });
}
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProducts,
};
