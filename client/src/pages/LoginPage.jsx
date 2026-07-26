import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { TABLES_CACHE_KEY } from "../constants";

function GoogleIcon() {
  return (
    <Box component="svg" viewBox="0 0 18 18" sx={{ width: 18, height: 18, flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.68 9c0-.593.102-1.17.284-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
    </Box>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // A new session may have different table permissions, so drop the
    // previous user's cached table data rather than serving it stale.
    localStorage.removeItem(TABLES_CACHE_KEY);

    const result = await login(email, password);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) setError(result.error);
    setGoogleLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 6, sm: 10 }, mb: 6 }}>
      <Box className="auth-card-enter" sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.35rem",
          }}
        >
          S
        </Box>
      </Box>

      <Paper variant="outlined" className="auth-card-enter" sx={{ p: { xs: 3, sm: 4.5 } }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom align="center">
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3.5 }}>
          Log in to query your library database in plain English
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={googleLoading ? null : <GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          sx={{ mb: 2.5, py: 1.2, borderColor: "divider", color: "text.primary" }}
        >
          {googleLoading ? <CircularProgress size={20} /> : "Continue with Google"}
        </Button>

        <Divider sx={{ my: 2.5, color: "text.disabled", fontSize: "0.75rem" }}>OR LOG IN WITH EMAIL</Divider>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
            autoComplete="email"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2.5, py: 1.2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Log in"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#22C55E", fontWeight: 600, textDecoration: "none" }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;