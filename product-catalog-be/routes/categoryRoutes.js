const { parse } = require("url");
const {
  createCategory,
  updateCategory,
  deleteCategory,
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
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      req.body = JSON.parse(body || "{}");
      createCategory(req, res);
    });
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

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      req.body = JSON.parse(body || "{}");
      updateCategory(req, res, id);
    });
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

  res.writeHead(404);
  res.end("Route not found");
}

module.exports = categoryRoutes;
