import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, Box, Container, CircularProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import TablesPage from "./pages/TablesPage";
import DocsPage from "./pages/DocsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { checkHealth } from "./services/api";
import darkTheme from "./theme";
import "./App.css";
import AdminPanel from "./pages/AdminPanel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

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

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await checkHealth();
      setBackendStatus("connected");
    } catch (error) {
      setBackendStatus("disconnected");
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

      {/* Main content wrapper */}
      <Box
        component="main"
        sx={{
          flex: 1,
          py: 4,
          px: { xs: 2, sm: 3 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            // Optional subtle card-like feel for pages
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Snackbar
            open={backendStatus === "disconnected"}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={6000} // remove if you want it to stay
          >
            <Alert severity="warning" variant="filled" sx={{ width: "100%" }}>
              Backend server is not fully responding. Some features may be
              limited.
            </Alert>
          </Snackbar>

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
        </Container>
      </Box>

      {/* Sticky footer */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 3,
          mt: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          color: "text.secondary",
          bgcolor: "background.paper",
        }}
      >
        Natural-language querying on a custom full-stack system
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
