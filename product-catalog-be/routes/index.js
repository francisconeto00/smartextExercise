const url = require("url");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const authMiddleware = require("../middlewares/authMiddleware");
async function mainRouter(req, res) {
  const parsedUrl = url.parse(req.url, true);

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
