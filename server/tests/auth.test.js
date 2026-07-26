const request = require("supertest");
const clearServerModuleCache = require("./helpers/clearCache");
const mockModule = require("./helpers/mockModule");
const createAuthState = require("./helpers/authState");

const authState = createAuthState("USER");

describe("Auth API", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    clearServerModuleCache();

    mockModule("../config/db", {
      query: vi.fn(),
      getConnection: vi.fn(),
    });

    mockModule("../config/firebaseAdmin", {
      hasFirebaseCredentials: () => false,
      getFirebaseAdminStatus: () => ({
        source: null,
        error: "No Firebase Admin credentials were found.",
      }),
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
    console.log(require.resolve("../middleware/auth"));
    app = require("../app");
    authState.role = "USER";
  });

  test("GET /api/auth/status returns Firebase Admin status", async () => {
    const res = await request(app).get("/api/auth/status");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      firebaseAdminConfigured: false,
      source: null,
      error: "No Firebase Admin credentials were found.",
    });
  });

  test("GET /api/auth/me returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: "Access denied. No token provided.",
    });
  });

  test("GET /api/auth/me returns the current user profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      user: {
        id: authState.user._id,
        firebaseUid: authState.user.firebaseUid,
        username: authState.user.username,
        email: authState.user.email,
        role: authState.user.role,
        createdAt: authState.user.createdAt.toISOString(),
        lastLogin: authState.user.lastLogin.toISOString(),
      },
    });
  });

  test("GET /api/auth/permissions returns role permissions", async () => {
    const res = await request(app)
      .get("/api/auth/permissions")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.role).toBe("USER");
    expect(res.body.permissions).toMatchObject({
      allowedTables: ["books"],
      allowedOperations: ["SELECT"],
      canModifySchema: false,
    });
  });
});
