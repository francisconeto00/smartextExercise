const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(401);
    return res.end("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.writeHead(401);
    res.end("Unauthorized");
  }
}

module.exports = authMiddleware;
