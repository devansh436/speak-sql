const createAuthState = (role = "USER") => ({
  user: {
    _id: "507f1f77bcf86cd799439011",
    firebaseUid: "firebase-123",
    username: role.toLowerCase(),
    email: `${role.toLowerCase()}@example.com`,
    role,
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date("2024-01-02"),
  },
  role,
});

module.exports = createAuthState;