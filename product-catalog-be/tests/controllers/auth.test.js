process.env.JWT_SECRET = "testsecret";

const {
  register,
  login,
  checkAuth,
} = require("../../controllers/authController");
const { User } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../models");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

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
    res.body = chunk;
  };
  return res;
}

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    test("missing username or password returns 400", (done) => {
      const req = createReq({ username: "user" });
      const res = createRes();
      register(req, res);
      req.trigger();
      setImmediate(() => {
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe(
          "Username and password required"
        );
        done();
      });
    });

    test("register with existing username returns 409", (done) => {
      User.findOne.mockResolvedValue({ id: 1, username: "existing" });

      const req = createReq({ username: "existing", password: "pass" });
      const res = createRes();

      register(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(409);
        expect(JSON.parse(res.body).error).toBe("User exists");
        done();
      });
    });

    test("registers a new user and returns success message with cookie", (done) => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      User.create.mockResolvedValue({ id: 1, username: "newuser" });
      jwt.sign.mockReturnValue("signedtoken");

      const req = createReq({ username: "newuser", password: "pass" });
      const res = createRes();

      register(req, res);
      req.trigger();

      setImmediate(() => {
        expect(User.findOne).toHaveBeenCalledWith({
          where: { username: "newuser" },
        });
        expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
        expect(User.create).toHaveBeenCalledWith({
          username: "newuser",
          password: "hashedpassword",
        });
        expect(jwt.sign).toHaveBeenCalled();
        expect(res.statusCode).toBe(201);
        expect(res.headers["Set-Cookie"]).toMatch(/^token=signedtoken/);
        expect(JSON.parse(res.body)).toEqual({ message: "success" });
        done();
      });
    });
  });

  describe("login", () => {
    test("missing username or password returns 400", (done) => {
      const req = createReq({ username: "user" });
      const res = createRes();

      login(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe(
          "Username and password required"
        );
        done();
      });
    });

    test("login with wrong username returns 401", (done) => {
      User.findOne.mockResolvedValue(null);

      const req = createReq({ username: "wronguser", password: "pass" });
      const res = createRes();

      login(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body).error).toBe("Invalid credentials");
        done();
      });
    });

    test("login with wrong password returns 401", (done) => {
      User.findOne.mockResolvedValue({
        id: 1,
        username: "user",
        password: "hashed",
      });
      bcrypt.compare.mockResolvedValue(false);

      const req = createReq({ username: "user", password: "wrongpass" });
      const res = createRes();

      login(req, res);
      req.trigger();

      setImmediate(() => {
        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body).error).toBe("Invalid credentials");
        done();
      });
    });

    test("successful login returns token and sets cookie", (done) => {
      User.findOne.mockResolvedValue({
        id: 1,
        username: "user",
        password: "hashed",
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("signedtoken");

      const req = createReq({ username: "user", password: "pass" });
      const res = createRes();

      login(req, res);
      req.trigger();

      setImmediate(() => {
        expect(User.findOne).toHaveBeenCalledWith({
          where: { username: "user" },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith("pass", "hashed");
        expect(jwt.sign).toHaveBeenCalledWith(
          { id: 1, username: "user" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        expect(res.statusCode).toBe(200);
        expect(res.headers["Set-Cookie"]).toMatch(/^token=signedtoken/);
        expect(JSON.parse(res.body)).toEqual({ message: "success" });
        done();
      });
    });
  });

  describe("checkAuth", () => {
    test("returns 401 if no cookie is provided", async () => {
      const req = { headers: {} };
      const res = createRes();

      await checkAuth(req, res);

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body).error).toBe("No token provided");
    });

    test("returns 401 if token is not found in cookie", async () => {
      const req = { headers: { cookie: "othercookie=value" } };
      const res = createRes();

      await checkAuth(req, res);

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body).error).toBe("Token not found");
    });

    test("returns 200 if valid token is provided", async () => {
      jwt.verify.mockReturnValue({ id: 1, username: "user" });

      const req = { headers: { cookie: "token=validtoken" } };
      const res = createRes();

      await checkAuth(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "validtoken",
        process.env.JWT_SECRET
      );
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ message: "Authenticated" });
    });

    test("returns 401 if token is invalid", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });

      const req = { headers: { cookie: "token=invalidtoken" } };
      const res = createRes();

      await checkAuth(req, res);

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body).error).toBe("Invalid or expired token");
    });
  });
});
