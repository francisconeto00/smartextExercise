const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/categoryController");
const { Category } = require("../../models");

jest.mock("../../models");

function createReq(bodyObj) {
  const body = JSON.stringify(bodyObj);
  let dataCallback, endCallback;
  return {
    on: (event, cb) => {
      if (event === "data") dataCallback = cb;
      if (event === "end") endCallback = cb;
    },
    trigger: () => {
      dataCallback(body);
      endCallback();
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
    res.headers = headers;
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

    test("creates a category successfully", (done) => {
      const fakeCategory = { id: 1, title: "cat1", description: "desc" };
      Category.create.mockResolvedValue(fakeCategory);

      const req = createReq({ title: "cat1", description: "desc" });
      const res = createRes();

      createCategory(req, res);
      req.trigger();

      setImmediate(() => {
        expect(Category.create).toHaveBeenCalledWith({
          title: "cat1",
          description: "desc",
        });
        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.body)).toEqual(fakeCategory);
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
        done();
      });
    });
  });

  describe("updateCategory", () => {
    test("not found returns 404", (done) => {
      Category.findByPk.mockResolvedValue(null);

      const req = createReq({ title: "new title" });
      const res = createRes();

      updateCategory(req, res, 99);
      req.trigger();

      setImmediate(() => {
        expect(Category.findByPk).toHaveBeenCalledWith(99);
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
      const categoryInstance = {
        id: 3,
        title: "old title",
        description: "old desc",
        save: jest.fn().mockResolvedValue(),
      };
      Category.findByPk.mockResolvedValue(categoryInstance);

      const req = createReq({ title: "new title" });
      const res = createRes();

      updateCategory(req, res, 3);
      req.trigger();

      setImmediate(() => {
        expect(categoryInstance.title).toBe("new title");
        expect(categoryInstance.description).toBe("old desc");
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

    test("invalid JSON returns 500", (done) => {
      const req = {
        on: (event, cb) => {
          if (event === "data") cb("invalid json");
          if (event === "end") cb();
        },
      };
      const res = createRes();

      updateCategory(req, res, 1);

      setImmediate(() => {
        expect(res.statusCode).toBe(500);
        done();
      });
    });
  });

  describe("deleteCategory", () => {
    test("not found returns 404", async () => {
      Category.findByPk.mockResolvedValue(null);

      const res = createRes();

      await deleteCategory(
        {
          /*req*/
        },
        res,
        123
      );

      expect(Category.findByPk).toHaveBeenCalledWith(123);
      expect(res.statusCode).toBe(404);
      expect(res.body).toBe("Not found");
    });

    test("deletes category successfully", async () => {
      const categoryInstance = {
        destroy: jest.fn().mockResolvedValue(),
      };
      Category.findByPk.mockResolvedValue(categoryInstance);

      const res = createRes();

      await deleteCategory(
        {
          /*req*/
        },
        res,
        321
      );

      expect(categoryInstance.destroy).toHaveBeenCalled();
      expect(res.statusCode).toBe(204);
      expect(res.body).toBe("");
    });

    test("error on delete returns 500", async () => {
      Category.findByPk.mockRejectedValue(new Error("DB fail"));

      const res = createRes();

      await deleteCategory(
        {
          /*req*/
        },
        res,
        1
      );

      expect(res.statusCode).toBe(500);
      expect(res.body).toBe("DB fail");
    });
  });
});
