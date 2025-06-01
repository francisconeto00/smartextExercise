process.env.JWT_SECRET = "testsecret";
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProducts,
} = require("../../controllers/productController");
const { Product } = require("../../models");

jest.mock("../../models");

function createReq(urlStr = "/", bodyObj = null) {
  const body = bodyObj ? JSON.stringify(bodyObj) : "";
  let dataCallback, endCallback;
  return {
    url: urlStr,
    on: (event, cb) => {
      if (event === "data") dataCallback = cb;
      if (event === "end") endCallback = cb;
    },
    trigger: () => {
      if (bodyObj) dataCallback(body);
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
    res.headers = headers || {};
  };
  res.end = (chunk) => {
    res.body = chunk;
  };
  return res;
}

describe("Product Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllProducts", () => {
    test("returns paginated products", async () => {
      Product.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [
          { id: 1, title: "P1" },
          { id: 2, title: "P2" },
        ],
      });

      const req = { url: "/?page=1&pageSize=2" };
      const res = createRes();

      await getAllProducts(req, res);

      expect(res.statusCode).toBe(200);
      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 2,
          offset: 0,
        })
      );
      expect(JSON.parse(res.body)).toHaveLength(2);
    });

    test("handles internal error", async () => {
      Product.findAndCountAll.mockRejectedValue(new Error("DB error"));

      const req = { url: "/" };
      const res = createRes();

      await getAllProducts(req, res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toBe("DB error");
    });
  });

  describe("getProductById", () => {
    test("returns a product if found", async () => {
      Product.findByPk.mockResolvedValue({ id: 1, title: "Product" });

      const res = createRes();
      await getProductById({}, res, 1);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ id: 1, title: "Product" });
    });

    test("returns 404 if not found", async () => {
      Product.findByPk.mockResolvedValue(null);

      const res = createRes();
      await getProductById({}, res, 999);

      expect(res.statusCode).toBe(404);
      expect(res.body).toBe("Not found");
    });
  });

  describe("createProduct", () => {
    test("creates a product successfully", (done) => {
      Product.create.mockResolvedValue({ id: 1, title: "Created" });

      const req = createReq("/", {
        title: "Created",
        description: "Desc",
        price: 10,
        categoryId: 1,
      });
      const res = createRes();

      createProduct(req, res);
      req.trigger();

      setImmediate(() => {
        expect(Product.create).toHaveBeenCalled();
        expect(res.statusCode).toBe(201);
        expect(JSON.parse(res.body).title).toBe("Created");
        done();
      });
    });

    test("returns 400 if missing title", (done) => {
      const req = createReq("/", {
        description: "Desc",
        price: 10,
      });
      const res = createRes();

      createProduct(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("Missing title");
        done();
      });
    });

    test("handles internal error", (done) => {
      Product.create.mockRejectedValue(new Error("DB error"));

      const req = createReq("/", {
        title: "Test",
        price: 5,
      });
      const res = createRes();

      createProduct(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(500);
        expect(res.body).toBe("DB error");
        done();
      });
    });
  });

  describe("updateProduct", () => {
    test("updates existing product", (done) => {
      const mockProduct = {
        id: 1,
        title: "Old",
        description: "Old desc",
        price: 10,
        categoryId: 1,
        save: jest.fn().mockResolvedValue(true),
      };
      Product.findByPk.mockResolvedValue(mockProduct);

      const req = createReq("/", {
        title: "Updated",
        price: 20,
      });
      const res = createRes();

      updateProduct(req, res, 1);
      req.trigger();

      setImmediate(() => {
        expect(Product.findByPk).toHaveBeenCalledWith(1);
        expect(mockProduct.title).toBe("Updated");
        expect(mockProduct.price).toBe(20);
        expect(res.statusCode).toBe(200);
        done();
      });
    });

    test("returns 404 if product not found", (done) => {
      Product.findByPk.mockResolvedValue(null);

      const req = createReq("/", { title: "X" });
      const res = createRes();

      updateProduct(req, res, 999);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(404);
        expect(res.body).toBe("Not found");
        done();
      });
    });
  });

  describe("deleteProducts", () => {
    test("deletes products successfully", (done) => {
      Product.destroy.mockResolvedValue(2);

      const req = createReq("/", { ids: [1, 2] });
      const res = createRes();

      deleteProducts(req, res);
      req.trigger();

      setImmediate(() => {
        expect(Product.destroy).toHaveBeenCalledWith({
          where: { id: [1, 2] },
        });
        expect(res.statusCode).toBe(200);
        const response = JSON.parse(res.body);
        expect(response.deletedCount).toBe(2);
        done();
      });
    });

    test("returns 404 if no products deleted", (done) => {
      Product.destroy.mockResolvedValue(0);

      const req = createReq("/", { ids: [99] });
      const res = createRes();

      deleteProducts(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res.body).message).toBe("No products were deleted");
        done();
      });
    });

    test("returns 400 for missing or invalid ids", (done) => {
      const req = createReq("/", { ids: [] });
      const res = createRes();

      deleteProducts(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(400);
        expect(res.body).toBe("Missing or invalid ids");
        done();
      });
    });
  });
});
