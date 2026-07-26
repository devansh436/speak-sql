const request = require("supertest");
const mongoose = require("mongoose");
const clearServerModuleCache = require("./helpers/clearCache");
const mockModule = require("./helpers/mockModule");

describe("Health API", () => {
  let app;
  let pool;

  beforeEach(() => {
    vi.clearAllMocks();
    clearServerModuleCache();

    pool = {
      query: vi.fn(),
    };

    mockModule("../config/db", pool);
    app = require("../app");

    Object.defineProperty(mongoose.connection, "readyState", {
      value: 1,
      configurable: true,
    });
    pool.query.mockResolvedValue([[{ count: 42 }]]);
  });

  test("GET /api/health reports unhealthy when MySQL fails", async () => {
    pool.query.mockRejectedValue(new Error("Database down"));

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
  });

  test("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "healthy",
      server: "running",
      mongodb: "disconnected",
      mysql: "connected",
      bookCount: 42,
    });
    expect(typeof res.body.timestamp).toBe("string");
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) as count FROM books",
    );
  });
});
