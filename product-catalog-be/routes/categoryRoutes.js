const { parse } = require("url");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} = require("../controllers/categoryController");

async function categoryRoutes(req, res) {
  const parsedUrl = parse(req.url, true);
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  const method = req.method;

  if (
    method === "POST" &&
    pathParts.length === 2 &&
    pathParts[1] === "categories"
  ) {
    createCategory(req, res);
    return;
  }

  if (
    method === "PUT" &&
    pathParts.length === 3 &&
    pathParts[1] === "categories"
  ) {
    const id = parseInt(pathParts[2]);
    if (isNaN(id)) {
      res.writeHead(400);
      return res.end("Invalid ID");
    }
    updateCategory(req, res, id);
    return;
  }

  if (
    method === "DELETE" &&
    pathParts.length === 3 &&
    pathParts[1] === "categories"
  ) {
    const id = parseInt(pathParts[2]);
    if (isNaN(id)) {
      res.writeHead(400);
      return res.end("Invalid ID");
    }

    deleteCategory(req, res, id);
    return;
  }

  if (
    method === "GET" &&
    pathParts.length === 2 &&
    pathParts[1] === "categories"
  ) {
    return getCategories(req, res);
  }

  res.writeHead(404);
  res.end("Route not found");
}

module.exports = categoryRoutes;
