import React, { useState, useEffect, useMemo } from "react";
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
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
  // MenuBookIcon,
  // PeopleIcon,
  // BadgeIcon,
  // ReceiptLongIcon
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import CachedIcon from "@mui/icons-material/Cached";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { getTables } from "../services/api";
import { TABLES_CACHE_KEY, TABLES_CACHE_DURATION_MS } from "../constants";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const TRUNCATE_AT = 48;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function readCache() {
  try {
    const cached = localStorage.getItem(TABLES_CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp >= TABLES_CACHE_DURATION_MS) {
      localStorage.removeItem(TABLES_CACHE_KEY);
      return null;
    }
    return { data, timestamp };
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(TABLES_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}


const TABLE_CONFIG = [
  { name: "books", label: "Books", icon: <AutoStoriesIcon /> },
  { name: "members", label: "Members", icon: <GroupIcon /> },
  { name: "staff", label: "Staff", icon: <AdminPanelSettingsIcon /> },
  { name: "transactions", label: "Transactions", icon: <ReceiptLongIcon /> },
];

// Same truncate-and-tooltip treatment as the query results table, so long
// values (addresses, emails, notes) don't blow out column widths.
function CellValue({ value }) {
  if (value === null || value === undefined) {
    return (
      <Chip label="NULL" size="small" variant="outlined" sx={{ opacity: 0.6 }} />
    );
  }
  const text = String(value);
  const isLong = text.length > TRUNCATE_AT;
  const display = (
    <Box sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {text}
    </Box>
  );
  return isLong ? (
    <Tooltip title={text} arrow placement="top-start" enterDelay={400}>
      <span>{display}</span>
    </Tooltip>
  ) : (
    display
  );
}

function TablesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    setSearch("");
    setPage(0);
  }, [tabValue]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const loadTables = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = readCache();
      if (cached) {
        setTables(cached.data);
        setLastFetched(new Date(cached.timestamp));
        setIsCached(true);
        setLoading(false);
        return;
      }
    }
    await fetchAllTables();
  };

  const fetchAllTables = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsCached(false);

      const response = await getTables();
      if (!response.success) throw new Error(response.error || "Failed to load tables");

      setTables(response.tables);
      setLastFetched(new Date());
      writeCache(response.tables);
    } catch (err) {
      setError(err.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => loadTables(true);

  const formatLastFetched = () => {
    if (!lastFetched) return "";
    const diff = Math.floor((Date.now() - lastFetched) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const visibleTables = TABLE_CONFIG.filter(
    (table) => tables[table.name] && tables[table.name].length > 0
  );

  const activeTable = visibleTables[tabValue];
  const activeRows = activeTable ? tables[activeTable.name] : [];

  const filteredRows = useMemo(() => {
    if (!search.trim()) return activeRows;
    const q = search.trim().toLowerCase();
    return activeRows.filter((row) =>
      Object.values(row).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
    );
  }, [activeRows, search]);

  const pageRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && !isCached) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
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

  if (visibleTables.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          You don't have access to any tables with your current role. Contact
          an administrator to request table access.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <StorageIcon sx={{ fontSize: 34, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Database Tables
            </Typography>
            {lastFetched && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                {isCached && <CachedIcon sx={{ fontSize: 15, color: "text.secondary" }} />}
                <Typography variant="caption" color="text.secondary">
                  {isCached ? "Cached" : "Fresh"} · updated {formatLastFetched()}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Tooltip title="Refresh data from database">
          <span>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading}>
              Refresh
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ "& .MuiTab-root": { fontWeight: 600, py: 2 } }}
          >
            {visibleTables.map((table) => (
              <Tab
                key={table.name}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span aria-hidden="true">{table.icon}</span>
                    <span>{table.label}</span>
                    <Chip
                      label={tables[table.name].length}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={tabValue}>
          <Box sx={{ px: { xs: 2, sm: 3 }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder={`Search in ${activeTable?.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")} aria-label="Clear search">
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {search && (
              <Typography variant="caption" color="text.secondary">
                {filteredRows.length} of {activeRows.length} rows match
              </Typography>
            )}
          </Box>

          <TableContainer sx={{ maxHeight: 560, mt: 2 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {activeRows[0] &&
                    Object.keys(activeRows[0]).map((column) => (
                      <TableCell key={column}>{column}</TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeRows[0] ? Object.keys(activeRows[0]).length : 1}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                        No rows match "{search}"
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row, rowIndex) => (
                    <TableRow key={page * rowsPerPage + rowIndex} hover>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <CellValue value={value} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRows.length > ROWS_PER_PAGE_OPTIONS[0] && (
            <TablePagination
              component="div"
              count={filteredRows.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            />
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default TablesPage;