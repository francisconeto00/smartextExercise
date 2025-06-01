const { register, login } = require("../controllers/authController");
const url = require("url");

async function authRoutes(req, res) {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === "POST") {
    if (parsedUrl.pathname === "/api/register") {
      return register(req, res);
    }
    if (parsedUrl.pathname === "/api/login") {
      return login(req, res);
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Auth route not found" }));
}

module.exports = authRoutes;
