import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  Fade,
  Tooltip,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import CircularProgress from "@mui/material/CircularProgress";

const TRUNCATE_AT = 48;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// Renders a cell value safely regardless of type (null/undefined/boolean/
// object all previously risked crashing or printing "[object Object]").
function stringifyValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Wide or long cell content (JSON blobs, long titles, addresses) would
// otherwise force horizontal scrolling on every row. Truncate visually and
// surface the full value on hover instead.
function CellValue({ value }) {
  const text = stringifyValue(value);

  if (text === null) {
    return (
      <Typography component="em" variant="body2" color="text.disabled">
        NULL
      </Typography>
    );
  }

  const isLong = text.length > TRUNCATE_AT;
  const display = (
    <Box
      sx={{
        maxWidth: 320,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
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

function EmptyState() {
  return (
    <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
      <StorageIcon sx={{ fontSize: 44, color: "text.disabled", mb: 2 }} />
      <Typography color="text.secondary" variant="h6">
        Enter a question above to see results
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
        Your query results will appear here
      </Typography>
    </Paper>
  );
}

function LoadingState() {
  return (
    <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
      <CircularProgress size={32} thickness={4} sx={{ mb: 2 }} />
      <Typography color="text.secondary" variant="body1">
        Running your query...
      </Typography>
    </Paper>
  );
}

function ErrorState({ result }) {
  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Alert severity="error" icon={<ErrorIcon />}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Query failed
        </Typography>
        <Typography variant="body2">{result.error}</Typography>
        {result.query && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              Generated SQL:
            </Typography>
            <Box
              sx={{
                fontSize: "12px",
                bgcolor: "background.default",
                p: 1.5,
                borderRadius: 1,
                fontFamily: "monospace",
                border: "1px solid",
                borderColor: "divider",
                overflow: "auto",
              }}
            >
              {result.query}
            </Box>
          </Box>
        )}
      </Alert>
    </Paper>
  );
}

function ResultsTable({ result, loading }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copied, setCopied] = useState(false);

  const results = result?.success ? result.results : null;

  useEffect(() => {
    setPage(0);
  }, [results]);

  if (loading) return <LoadingState />;
  if (!result) return <EmptyState />;
  if (!result.success) return <ErrorState result={result} />;

  const { query, rowCount, attempt } = result;
  const columns = results.length > 0 ? Object.keys(results[0]) : [];
  const pageRows = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission denied or unavailable — silently ignore, the
      // query text is still visible for manual copy.
    }
  };

  return (
    <Fade in timeout={400}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
          <Typography variant="h6">Results</Typography>
          <Chip
            label={`${rowCount} row${rowCount !== 1 ? "s" : ""}`}
            size="small"
            color="success"
            variant="outlined"
            sx={{ ml: 1 }}
          />
          {attempt > 1 && (
            <Chip
              label={`Self-corrected · attempt ${attempt}`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <CodeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption">Generated SQL</Typography>
            </Box>
            <Tooltip title={copied ? "Copied" : "Copy SQL"} arrow>
              <IconButton size="small" onClick={handleCopy} aria-label="Copy generated SQL">
                {copied ? (
                  <DoneIcon sx={{ fontSize: 16, color: "success.main" }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              fontSize: "13px",
              bgcolor: "background.default",
              color: "primary.light",
              p: 1.75,
              borderRadius: 1.5,
              fontFamily: "monospace",
              border: "1px solid",
              borderColor: "divider",
              overflow: "auto",
            }}
          >
            {query}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {results.length === 0 ? (
          <Alert severity="info">No results found</Alert>
        ) : (
          <>
            <TableContainer variant="outlined" component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column}>{column}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((row, index) => (
                    <TableRow
                      key={page * rowsPerPage + index}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      {columns.map((column) => (
                        <TableCell key={column}>
                          <CellValue value={row[column]} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {results.length > ROWS_PER_PAGE_OPTIONS[0] && (
              <TablePagination
                component="div"
                count={results.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                sx={{ mt: 1 }}
              />
            )}
          </>
        )}
      </Paper>
    </Fade>
  );
}

export default ResultsTable;