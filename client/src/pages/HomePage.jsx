import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Alert, Paper, Chip } from "@mui/material";
import QueryInput from "../components/QueryInput";
import ResultsTable from "../components/ResultsTable";
import { executeQuery, getUserPermissions } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box textAlign="center" mb={5}>
        <Chip
          label="Natural language → SQL"
          size="small"
          variant="outlined"
          color="success"
          sx={{ mb: 2.5, fontWeight: 700, letterSpacing: "0.02em" }}
        />
        <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
          Speak<Box component="span" sx={{ color: "primary.main" }}>SQL</Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          Ask your library database a question in plain English
        </Typography>
      </Box>

      {permissions && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(34, 197, 94, 0.12)",
                flexShrink: 0,
              }}
            >
              <SecurityIcon sx={{ fontSize: 16, color: "primary.main" }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Access level: {user?.role}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 5, flexWrap: "wrap", mb: 2 }}>
            <Box>
              <Typography variant="overline" display="block" sx={{ mb: 1 }}>
                Tables you can query
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {permissions.allowedTables.map((table) => (
                  <Chip key={table} label={table} size="small" variant="outlined" color="success" />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="overline" display="block" sx={{ mb: 1 }}>
                Allowed operations
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {permissions.allowedOperations.map((op) => (
                  <Chip key={op} label={op} size="small" variant="outlined" color="info" />
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

      {result?.unauthorized && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {result.error}
        </Alert>
      )}

      <ResultsTable result={result} loading={loading} />
    </Container>
  );
}

export default HomePage;