const {
  createProduct,
  updateProduct,
  deleteProducts,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const url = require("url");

async function productRoutes(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const idMatch = parsedUrl.pathname.match(/^\/api\/products\/(\d+)/);
  const id = idMatch ? parseInt(idMatch[1]) : null;

  if (req.method === "POST" && parsedUrl.pathname === "/api/products") {
    return createProduct(req, res);
  }

  if (req.method === "GET" && id) {
    return getProductById(req, res, id);
  }
  if (req.method === "GET" && parsedUrl.pathname === "/api/products") {
    return getAllProducts(req, res);
  }

  if (req.method === "PUT" && id) {
    return updateProduct(req, res, id);
  }

  if (req.method === "DELETE" && parsedUrl.pathname === "/api/products") {
    return deleteProducts(req, res);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
}

module.exports = productRoutes;
