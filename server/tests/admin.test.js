const request = require("supertest");
const clearServerModuleCache = require("./helpers/clearCache");
const mockModule = require("./helpers/mockModule");
const createAuthState = require("./helpers/authState");

const authState = createAuthState("ADMIN");

describe("Admin API", () => {
  let app;
  let userModel;

  beforeEach(() => {
    vi.clearAllMocks();
    clearServerModuleCache();

    mockModule("../config/db", {
      query: vi.fn(),
      getConnection: vi.fn(),
    });

    userModel = {
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      countDocuments: vi.fn(),
    };

    mockModule("../models/User", userModel);
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
    authState.role = "ADMIN";
  });

  test("PATCH returns 404 when user does not exist", async () => {
    userModel.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/admin/users/123/role")
      .set("Authorization", "Bearer test-token")
      .send({ role: "STAFF" });

    expect(res.status).toBe(404);
  });

  test("GET /api/admin/users returns 403 for USER role", async () => {
    authState.role = "USER";

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(403);
  });

  test("GET /api/admin/users returns 401 without token", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.status).toBe(401);
  });

  test("GET /api/admin/users returns all users", async () => {
    userModel.find.mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        {
          _id: "1",
          username: "alice",
          email: "alice@example.com",
          role: "USER",
        },
      ]),
    });

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body.users).toEqual([
      {
        _id: "1",
        username: "alice",
        email: "alice@example.com",
        role: "USER",
      },
    ]);
  });

  test("DELETE returns 404 when user does not exist", async () => {
    userModel.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/admin/users/123")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(404);
  });

  test("PATCH /api/admin/users/:userId/role updates a role", async () => {
    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "2",
      username: "bob",
      email: "bob@example.com",
      role: "STAFF",
    });

    const res = await request(app)
      .patch("/api/admin/users/2/role")
      .set("Authorization", "Bearer test-token")
      .send({ role: "STAFF" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "Role updated successfully",
      user: {
        _id: "2",
        role: "STAFF",
      },
    });
  });

  test("DELETE /api/admin/users/:userId deletes a user", async () => {
    userModel.findByIdAndDelete.mockResolvedValue({
      username: "carol",
      email: "carol@example.com",
    });

    const res = await request(app)
      .delete("/api/admin/users/3")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "User deleted successfully",
      deletedUser: {
        username: "carol",
        email: "carol@example.com",
      },
    });
  });

  test("GET /api/admin/stats returns user statistics", async () => {
    userModel.countDocuments
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(7);

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalUsers: 12,
      byRole: {
        ADMIN: 2,
        STAFF: 3,
        USER: 7,
      },
    });
  });
});
