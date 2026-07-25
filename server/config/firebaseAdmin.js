const fs = require("fs");
const admin = require("firebase-admin");

let initialized = false;

function loadServiceAccount() {
  try {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      return {
        source: "FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY",
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      };
    }

    return null;
  } catch (error) {
    return {
      error: error.message,
    };
  }
}

function getFirebaseAdminStatus() {
  const serviceAccount = loadServiceAccount();

  if (!serviceAccount) {
    return {
      configured: false,
      source: null,
      error: "No Firebase Admin credentials were found.",
    };
  }

  if (serviceAccount.error) {
    return {
      configured: false,
      source: null,
      error: serviceAccount.error,
    };
  }

  return {
    configured: Boolean(
      serviceAccount.projectId &&
        serviceAccount.clientEmail &&
        serviceAccount.privateKey
    ),
    source: serviceAccount.source,
    error: null,
  };
}

function initializeFirebaseAdmin() {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return admin.app();
  }

  const serviceAccount = loadServiceAccount();

  if (
    !serviceAccount ||
    serviceAccount.error ||
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    throw new Error(
      "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey.replace(/\\n/g, "\n"),
    }),
  });

  initialized = true;
  return admin.app();
}

function getFirebaseAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

module.exports = {
  admin,
  getFirebaseAuth,
  hasFirebaseCredentials: () => getFirebaseAdminStatus().configured,
  getFirebaseAdminStatus,
};