const { User } = require("../models");
const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
async function register(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    try {
      const { username, password } = JSON.parse(body);
      // Validations
      if (!username || !password) {
        logger.warn("Register attempt with missing username or password");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Username and password required" })
        );
      }
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        logger.info(`Register attempt with existing username: ${username}`);
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "User exists" }));
      }

      // Create user
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashed });
      logger.info(`User created: ${username}`);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id: user.id, username: user.username }));
    } catch (err) {
      logger.error(`Register error: ${err.message}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
}

async function login(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    try {
      const { username, password } = JSON.parse(body);
      // Validations
      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Username and password required" })
        );
      }
      const user = await User.findOne({ where: { username } });

      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid credentials" }));
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid credentials" }));
      }
      // Token generation
      const token = jwt.sign({ id: user.id, username: user.username }, secret, {
        expiresIn: "1h",
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ token }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
}

module.exports = { register, login };
