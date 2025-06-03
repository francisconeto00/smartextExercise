jest.mock("../../models");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} = require("../../controllers/categoryController");
const { Category } = require("../../models");
const { Op } = require("sequelize");

function createReq(bodyObj = null, urlPath = "/") {
  const body = bodyObj ? JSON.stringify(bodyObj) : "";
  let dataCallback, endCallback;
  return {
    url: urlPath,
    on: (event, cb) => {
      if (event === "data") dataCallback = cb;
      if (event === "end") endCallback = cb;
    },
    trigger: () => {
      if (bodyObj && dataCallback) dataCallback(body);
      if (endCallback) endCallback();
    },
  };
}

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.headers = {};
  res.body = "";
  res.writeHead = (code, headers) => {
    res.statusCode = code;
    res.headers = headers || {};
  };
  res.end = (chunk) => {
    res.body = chunk !== undefined ? chunk : "";
  };
  return res;
}

describe("Category Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    test("missing title returns 400", (done) => {
      const req = createReq({ description: "desc only" });
      const res = createRes();

      createCategory(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("Missing title");
        done();
      });
    });

    test("creates category successfully", (done) => {
      const mockCategory = { id: 1, title: "Test", description: "Test Desc" };
      Category.create.mockResolvedValue(mockCategory);

      const req = createReq({ title: "Test", description: "Test Desc" });
      const res = createRes();

      createCategory(req, res);
      req.trigger();

      setImmediate(() => {
        expect(Category.create).toHaveBeenCalledWith({
          title: "Test",
          description: "Test Desc",
        });
        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.body)).toEqual(mockCategory);
        done();
      });
    });

    test("invalid JSON returns 500", (done) => {
      const req = {
        on: (event, cb) => {
          if (event === "data") cb("invalid json");
          if (event === "end") cb();
        },
      };
      const res = createRes();

      createCategory(req, res);

      setImmediate(() => {
        expect(res.statusCode).toBe(500);
        expect(res.body).toMatch(/Unexpected token/);
        done();
      });
    });
  });

  describe("updateCategory", () => {
    test("returns 404 if not found", (done) => {
      Category.findByPk.mockResolvedValue(null);
      const req = createReq({ title: "Updated" });
      const res = createRes();

      updateCategory(req, res, 1);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(404);
        expect(res.body).toBe("Not found");
        done();
      });
    });

    test("updates category successfully", (done) => {
      const categoryInstance = {
        id: 2,
        title: "old title",
        description: "old desc",
        save: jest.fn().mockResolvedValue(),
      };
      Category.findByPk.mockResolvedValue(categoryInstance);

      const req = createReq({ title: "new title", description: "new desc" });
      const res = createRes();

      updateCategory(req, res, 2);
      req.trigger();

      setImmediate(() => {
        expect(categoryInstance.title).toBe("new title");
        expect(categoryInstance.description).toBe("new desc");
        expect(categoryInstance.save).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual({
          id: categoryInstance.id,
          title: categoryInstance.title,
          description: categoryInstance.description,
        });
        done();
      });
    });

    test("updates category with partial data", (done) => {
      const instance = {
        id: 3,
        title: "old title",
        description: "old desc",
        save: jest.fn().mockResolvedValue(),
      };

      Category.findByPk.mockResolvedValue(instance);

      const req = createReq({ title: "New", description: "New Desc" });
      const res = createRes();

      updateCategory(req, res, 1);
      req.trigger();

      setImmediate(() => {
        try {
          expect(instance.title).toBe("New");
          expect(instance.description).toBe("New Desc");
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res.body)).toEqual({
            id: instance.id,
            title: instance.title,
            description: instance.description,
          });
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    test("invalid JSON returns 500", (done) => {
      const req = {
        on: (event, cb) => {
          if (event === "data") cb("invalid json");
          if (event === "end") cb();
        },
      };
      const res = createRes();

      updateCategory(req, res, 3);

      setImmediate(() => {
        expect(res.statusCode).toBe(500);
        expect(res.body).toMatch(/Unexpected token/);
        done();
      });
    });
  });

  describe("deleteCategory", () => {
    test("returns 404 if not found", async () => {
      Category.findByPk.mockResolvedValue(null);
      const res = createRes();

      await deleteCategory({}, res, 10);

      expect(res.statusCode).toBe(404);
      expect(res.body).toBe("Not found");
    });

    test("deletes successfully", async () => {
      const instance = { destroy: jest.fn().mockResolvedValue() };
      Category.findByPk.mockResolvedValue(instance);
      const res = createRes();

      await deleteCategory({}, res, 5);

      expect(instance.destroy).toHaveBeenCalled();
      expect(res.statusCode).toBe(204);
      expect(res.body).toBe("");
    });

    test("throws error returns 500", async () => {
      Category.findByPk.mockRejectedValue(new Error("Delete failed"));
      const res = createRes();

      await deleteCategory({}, res, 99);

      expect(res.statusCode).toBe(500);
      expect(res.body).toBe("Delete failed");
    });
  });

  describe("getCategories", () => {
    test("returns categories with pagination", async () => {
      const mockData = {
        rows: [{ id: 1, title: "Test", description: "Desc" }],
        count: 1,
      };
      Category.findAndCountAll.mockResolvedValue(mockData);

      const req = { url: "/?page=1&pageSize=1" };
      const res = createRes();

      await getCategories(req, res);

      expect(Category.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        offset: 0,
        limit: 1,
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.data.length).toBe(1);
      expect(json.pagination).toEqual({ page: 1, pageSize: 1, totalPages: 1 });
    });

    test("search query filters correctly", async () => {
      const mockData = {
        rows: [],
        count: 0,
      };
      Category.findAndCountAll.mockResolvedValue(mockData);

      const req = { url: "/?search=abc" };
      const res = createRes();

      await getCategories(req, res);

      expect(Category.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            [Op.or]: [
              { title: { [Op.like]: "%abc%" } },
              { description: { [Op.like]: "%abc%" } },
            ],
          },
        })
      );
      expect(res.statusCode).toBe(200);
    });

    test("handles errors", async () => {
      Category.findAndCountAll.mockRejectedValue(new Error("DB Error"));
      const req = { url: "/" };
      const res = createRes();

      await getCategories(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({
        error: "Failed to fetch categories",
      });
    });
  });
});
