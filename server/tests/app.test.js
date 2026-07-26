const request = require("supertest");
const clearServerModuleCache = require("./helpers/clearCache");
const mockModule = require("./helpers/mockModule");

describe("App routes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    clearServerModuleCache();

    mockModule("../config/db", {
      query: vi.fn(),
      getConnection: vi.fn(),
    });

    app = require("../app");
  });

  test("GET / returns the app status payload", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "SpeakSQL",
      status: "running",
      docs: "/api-docs",
      health: "/api/health",
    });
  });

  test("unknown routes return 404", async () => {
    const res = await request(app).get("/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });
});