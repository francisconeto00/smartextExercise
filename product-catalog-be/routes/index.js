const url = require("url");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const authMiddleware = require("../middlewares/authMiddleware");
async function mainRouter(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  const parsedUrl = url.parse(req.url, true);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (
    parsedUrl.pathname.startsWith("/api/register") ||
    parsedUrl.pathname.startsWith("/api/login")
  ) {
    return authRoutes(req, res);
  }

  authMiddleware(req, res, () => {
    if (parsedUrl.pathname.startsWith("/api/categories")) {
      return categoryRoutes(req, res);
    }
    if (parsedUrl.pathname.startsWith("/api/products")) {
      return productRoutes(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  });
}

module.exports = mainRouter;
