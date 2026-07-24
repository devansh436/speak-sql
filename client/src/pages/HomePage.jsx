import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Chip,
} from "@mui/material";
import { Fade } from "@mui/material";
import QueryInput from "../components/QueryInput";
import ResultsTable from "../components/ResultsTable";
import { executeQuery, getUserPermissions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SecurityIcon from "@mui/icons-material/Security";

function HomePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const data = await getUserPermissions();
      setPermissions(data.permissions);
    } catch (error) {
      console.error("Failed to load permissions:", error);
    }
  };

  const handleQuery = async (question) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await executeQuery(question);
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error.error || "An unexpected error occurred",
        unauthorized: error.unauthorized,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box textAlign="center" mb={5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <PsychologyIcon sx={{ fontSize: 48, color: "secondary.main" }} />
          </Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              background: "linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Library NLQ System
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400 }}
          >
            Natural Language Query to MySQL using NLP
          </Typography>
        </Box>
      </Fade>

      {/* User Permissions Card */}
      {permissions && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">
              Your Access Level: {user?.role}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allowed Tables:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {permissions.allowedTables.map((table) => (
                  <Chip
                    key={table}
                    label={table}
                    size="small"
                    color="success"
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Allowed Operations:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {permissions.allowedOperations.map((op) => (
                  <Chip key={op} label={op} size="small" color="info" />
                ))}
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {permissions.description}
          </Typography>
        </Paper>
      )}

      <QueryInput onSubmit={handleQuery} loading={loading} />

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress size={48} thickness={4} />
        </Box>
      )}

      {result?.unauthorized && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {result.error}
        </Alert>
      )}

      <ResultsTable result={result} />
    </Container>
  );
}

export default HomePage;
