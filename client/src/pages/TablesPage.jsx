import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Button,
  Tooltip,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import CachedIcon from "@mui/icons-material/Cached";
import { getTables } from "../services/api";

const CACHE_KEY = "library_tables_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function TablesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async (forceRefresh = false) => {
    // Try to load from cache first
    if (!forceRefresh) {
      const cached = loadFromCache();
      if (cached) {
        setTables(cached.data);
        setLastFetched(new Date(cached.timestamp));
        setIsCached(true);
        setLoading(false);
        return;
      }
    }

    // Fetch from API if cache miss or forced refresh
    await fetchAllTables();
  };

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Check if cache is still valid
      if (age < CACHE_DURATION) {
        return { data, timestamp };
      }

      // Cache expired
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Cache read error:", error);
      return null;
    }
  };

  const saveToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Cache write error:", error);
    }
  };

  const fetchAllTables = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsCached(false);

      // Use the new role-based tables API instead of executing queries via LLM
      const response = await getTables();

      if (response.success) {
        setTables(response.tables);
        setLastFetched(new Date());
        saveToCache(response.tables);
      } else {
        throw new Error(response.error || "Failed to load tables");
      }
    } catch (err) {
      setError(err.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTables(true); // Force refresh
  };

  const formatLastFetched = () => {
    if (!lastFetched) return "";
    const now = new Date();
    const diff = Math.floor((now - lastFetched) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const tableConfig = [
    { name: "books", label: "Books", icon: "📚", color: "#60a5fa" },
    { name: "members", label: "Members", icon: "👤", color: "#34d399" },
    { name: "staff", label: "Staff", icon: "👨‍💼", color: "#a78bfa" },
    {
      name: "transactions",
      label: "Transactions",
      icon: "📝",
      color: "#fbbf24",
    },
  ].filter(
    (table) =>
      tables[table.name] &&
      tables[table.name] !== null &&
      tables[table.name].length > 0
  ); // Only show tables with data (not null or empty)

  if (loading && !isCached) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading database tables...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Error loading tables: {error}
        </Alert>
      </Container>
    );
  }

  // Check if user has no accessible tables
  if (tableConfig.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          You don't have access to any tables with your current role. Contact an
          administrator to grant you table access permissions.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <StorageIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Database Tables
                </Typography>
                {lastFetched && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    {isCached && (
                      <CachedIcon
                        sx={{ fontSize: 16, color: "success.main" }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {isCached ? "Cached data" : "Fresh data"} • Updated{" "}
                      {formatLastFetched()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Tooltip title="Refresh data from database">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Box>

          <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  },
                }}
              >
                {tableConfig.map((table, index) => (
                  <Tab
                    key={table.name}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{table.icon}</span>
                        <span>{table.label}</span>
                        <Chip
                          label={tables[table.name].length}
                          size="small"
                          sx={{
                            bgcolor: table.color,
                            color: "#000",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {tableConfig.map((table, index) => (
              <TabPanel key={table.name} value={tabValue} index={index}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {tables[table.name][0] &&
                          Object.keys(tables[table.name][0]).map((column) => (
                            <TableCell
                              key={column}
                              sx={{
                                fontWeight: 700,
                                bgcolor: "background.default",
                                color: "primary.main",
                                textTransform: "uppercase",
                                fontSize: "0.85rem",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {column}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tables[table.name].map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          hover
                          sx={{
                            "&:hover": {
                              bgcolor: "rgba(96, 165, 250, 0.05)",
                            },
                          }}
                        >
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {value === null ? (
                                <Chip
                                  label="NULL"
                                  size="small"
                                  variant="outlined"
                                  sx={{ opacity: 0.5 }}
                                />
                              ) : (
                                value.toString()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            ))}
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
}

export default TablesPage;
