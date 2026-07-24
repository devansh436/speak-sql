const User = require("../models/User");
const {
  getFirebaseAuth,
  hasFirebaseCredentials,
} = require("../config/firebaseAdmin");

function buildProfileFromFirebase(decodedToken) {
  const email = decodedToken.email || `${decodedToken.uid}@firebase.local`;
  const username =
    decodedToken.name || email.split("@")[0] || `user-${decodedToken.uid.slice(0, 8)}`;

  return {
    firebaseUid: decodedToken.uid,
    email: email.toLowerCase(),
    username,
  };
}

function resolveUserRole(user, decodedToken) {
  return (
    user?.role ||
    decodedToken?.role ||
    decodedToken?.customClaims?.role ||
    "USER"
  );
}

function buildUsernameCandidates(decodedToken) {
  const baseName =
    decodedToken.name ||
    decodedToken.email?.split("@")[0] ||
    `user-${decodedToken.uid.slice(0, 8)}`;

  const normalizedBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9]+$/, "") || `user-${decodedToken.uid.slice(0, 8)}`;

  return [
    normalizedBase,
    `${normalizedBase}_${decodedToken.uid.slice(0, 6)}`,
    `${normalizedBase}_${decodedToken.uid.slice(0, 10)}`,
  ];
}

async function findUniqueUsername(decodedToken) {
  const candidates = buildUsernameCandidates(decodedToken);

  for (const candidate of candidates) {
    const existing = await User.findOne({ username: candidate }).select("_id");
    if (!existing) {
      return candidate;
    }
  }

  return `${candidates[0]}_${Date.now().toString(36)}`;
}

async function upsertMongoUser(decodedToken) {
  const normalizedEmail = decodedToken.email?.toLowerCase();
  const firebaseUid = decodedToken.uid;

  let user = await User.findOne({ firebaseUid });

  if (!user && normalizedEmail) {
    user = await User.findOne({ email: normalizedEmail });
  }

  if (!user) {
    const username = await findUniqueUsername(decodedToken);
    return User.create({
      firebaseUid,
      username,
      email: normalizedEmail || `${firebaseUid}@firebase.local`,
      role: resolveUserRole(null, decodedToken),
    });
  }

  const updatedProfile = buildProfileFromFirebase(decodedToken);
  let shouldSave = false;

  if (!user.firebaseUid) {
    user.firebaseUid = updatedProfile.firebaseUid;
    shouldSave = true;
  }

  if (updatedProfile.email && user.email !== updatedProfile.email) {
    user.email = updatedProfile.email;
    shouldSave = true;
  }

  if (updatedProfile.username && user.username !== updatedProfile.username) {
    const usernameTaken = await User.findOne({
      username: updatedProfile.username,
      _id: { $ne: user._id },
    }).select("_id");

    if (!usernameTaken) {
      user.username = updatedProfile.username;
      shouldSave = true;
    }
  }

  if (!user.role) {
    user.role = resolveUserRole(user, decodedToken);
    shouldSave = true;
  }

  if (shouldSave) {
    await user.save();
  }

  return user;
}

// Middleware to verify Firebase ID token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    if (!hasFirebaseCredentials()) {
      return res.status(503).json({
        error:
          "Firebase Admin credentials are not configured on the server yet.",
      });
    }

    const decoded = await getFirebaseAuth().verifyIdToken(token);
    const user = await upsertMongoUser(decoded);

    if (!user) {
      return res.status(401).json({
        error: "Invalid token. User not found.",
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = resolveUserRole(user, decoded);
    req.firebaseUser = decoded;

    next();
  } catch (error) {
    if (error.code && String(error.code).startsWith("auth/")) {
      return res.status(401).json({ error: "Invalid Firebase token." });
    }
    if (
      error.message?.includes(
        "Firebase Admin credentials are not configured"
      )
    ) {
      return res.status(503).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Mongo user already exists with the same email or username.",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Authentication failed.",
      details: error.message,
    });
  }
};

// Middleware to check if user has required role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
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
  };
};

module.exports = {
  authenticate,
  authorize,
};
