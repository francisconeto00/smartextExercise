const { Category } = require("../models");

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

module.exports = { createCategory, updateCategory, deleteCategory };
