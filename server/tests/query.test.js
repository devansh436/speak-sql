const path = require("path");
const request = require("supertest");
const clearServerModuleCache = require("./helpers/clearCache");
const mockModule = require("./helpers/mockModule");
const createAuthState = require("./helpers/authState");

const serverRoot = path.resolve(__dirname, "..");

const authState = createAuthState("USER");

describe("Query API", () => {
  let app;
  let pool;
  let executeNLQuery;
  let extractSchema;

  beforeEach(() => {
    vi.clearAllMocks();
    clearServerModuleCache();

    pool = {
      query: vi.fn(),
      getConnection: vi.fn(),
    };
    executeNLQuery = vi.fn();
    extractSchema = vi.fn();

    mockModule("../config/db", pool);
    mockModule("../services/sqlService", {
      executeNLQuery,
    });
    mockModule("../utils/schemaExtractor", {
      extractSchema,
    });
    mockModule("../middleware/auth", {
      authenticate: (req, res, next) => {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
          return res.status(401).json({
            error: "Access denied. No token provided.",
          });
        }

        req.user = authState.user;
        req.userRole = authState.role;
        next();
      },
      authorize:
        (...allowedRoles) =>
        (req, res, next) => {
          if (!req.user) {
            return res.status(401).json({
              error: "Authentication required.",
            });
          }

          if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
              error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
              yourRole: req.userRole,
            });
          }

          next();
        },
    });

    app = require("../app");
    authState.role = "USER";

    executeNLQuery.mockResolvedValue({
      success: true,
      query: "SELECT * FROM books",
      results: [{ id: 1, title: "Example Book" }],
      rowCount: 1,
      role: "USER",
    });
    extractSchema.mockResolvedValue("Table: books\n  - id (int)");
    pool.query.mockResolvedValue([[{ id: 1, title: "Example Book" }]]);
  });

  test("POST /api/query returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/query")
      .send({ question: "Books" });

    expect(res.status).toBe(401);
  });

  test("POST /api/query returns 500 when service throws", async () => {
    executeNLQuery.mockRejectedValue(new Error("AI failed"));

    const res = await request(app)
      .post("/api/query")
      .set("Authorization", "Bearer test-token")
      .send({ question: "Books" });

    expect(res.status).toBe(500);
  });

  test("GET /api/schema returns 500 when schema extraction fails", async () => {
    extractSchema.mockRejectedValue(new Error("Schema error"));

    const res = await request(app)
      .get("/api/schema")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(500);
  });

  test("POST /api/query returns generated query results", async () => {
    const res = await request(app)
      .post("/api/query")
      .set("Authorization", "Bearer test-token")
      .send({ question: "Show all books" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      query: "SELECT * FROM books",
      rowCount: 1,
      role: "USER",
    });
    expect(executeNLQuery).toHaveBeenCalledWith("Show all books", "USER");
  });

  test("POST /api/query rejects empty questions", async () => {
    const res = await request(app)
      .post("/api/query")
      .set("Authorization", "Bearer test-token")
      .send({ question: "   " });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Question is required" });
  });

  test("GET /api/schema returns the current schema and permissions", async () => {
    const res = await request(app)
      .get("/api/schema")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      schema: "Table: books\n  - id (int)",
      userRole: "USER",
    });
    expect(res.body.permissions).toMatchObject({
      allowedTables: ["books"],
      allowedOperations: ["SELECT"],
    });
  });

  test("GET /api/permissions returns role permissions", async () => {
    const res = await request(app)
      .get("/api/permissions")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      role: "USER",
    });
    expect(res.body.permissions.allowedTables).toEqual(["books"]);
  });

  test("GET /api/tables returns allowed table rows", async () => {
    const res = await request(app)
      .get("/api/tables")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      role: "USER",
    });
    expect(res.body.tables).toEqual({
      books: [{ id: 1, title: "Example Book" }],
    });
    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM books LIMIT 50");
  });
});
