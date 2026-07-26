import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import TablesPage from "./pages/TablesPage";
import DocsPage from "./pages/DocsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPanel from "./pages/AdminPanel";
import { checkHealth } from "./services/api";
import darkTheme from "./theme";
import "./App.css";

const HEALTH_RETRY_INTERVAL = 15000;

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const retryTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    checkBackendHealth();
    return () => clearTimeout(retryTimer.current);
  }, []);

  const checkBackendHealth = async () => {
    try {
      await checkHealth();
      setBackendStatus("connected");
    } catch (error) {
      setBackendStatus("disconnected");
      setBannerDismissed(false);
      // Keep retrying quietly in the background until the backend comes back.
      retryTimer.current = setTimeout(checkBackendHealth, HEALTH_RETRY_INTERVAL);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <Snackbar
        open={backendStatus === "disconnected" && !bannerDismissed}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setBannerDismissed(true)}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setBannerDismissed(true)}
          sx={{ width: "100%" }}
        >
          Can't reach the server right now. Some features may be limited —
          we'll keep trying to reconnect.
        </Alert>
      </Snackbar>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box key={location.pathname} className="page-transition" sx={{ width: "100%" }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <TablesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docs"
              element={
                <ProtectedRoute>
                  <DocsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          color: "text.secondary",
          bgcolor: "background.paper",
        }}
      >
        Made with 🩵 by Devansh
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;