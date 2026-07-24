import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";

function ResultsTable({ result }) {
  if (!result) {
    return (
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            border: "1px solid rgba(96, 165, 250, 0.1)",
          }}
        >
          <StorageIcon
            sx={{ fontSize: 64, color: "primary.main", opacity: 0.3, mb: 2 }}
          />
          <Typography color="text.secondary" variant="h6">
            Enter a question above to see results
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            Your query results will appear here
          </Typography>
        </Paper>
      </Fade>
    );
  }

  if (!result.success) {
    return (
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            border: "1px solid rgba(248, 113, 113, 0.2)",
          }}
        >
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Query Failed
            </Typography>
            <Typography variant="body2">{result.error}</Typography>
            {result.query && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mb: 1, opacity: 0.8 }}
                >
                  Generated SQL:
                </Typography>
                <Box
                  sx={{
                    fontSize: "12px",
                    background: "rgba(15, 23, 42, 0.5)",
                    color: "#f87171",
                    padding: "12px",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    border: "1px solid rgba(248, 113, 113, 0.2)",
                    overflow: "auto",
                  }}
                >
                  {result.query}
                </Box>
              </Box>
            )}
          </Alert>
        </Paper>
      </Fade>
    );
  }

  const { query, results, rowCount, attempt } = result;

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          border: "1px solid rgba(52, 211, 153, 0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Zoom in timeout={300}>
            <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
          </Zoom>
          <Typography variant="h6">Query Results</Typography>
          <Zoom in timeout={400}>
            <Chip
              label={`${rowCount} row${rowCount !== 1 ? "s" : ""}`}
              size="small"
              sx={{
                ml: 1,
                backgroundColor: "rgba(52, 211, 153, 0.15)",
                color: "success.main",
                border: "1px solid rgba(52, 211, 153, 0.3)",
              }}
            />
          </Zoom>
          {attempt > 1 && (
            <Zoom in timeout={500}>
              <Chip
                label={`Self-corrected (Attempt ${attempt})`}
                size="small"
                sx={{
                  ml: 1,
                  backgroundColor: "rgba(251, 191, 36, 0.15)",
                  color: "warning.main",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                }}
              />
            </Zoom>
          )}
        </Box>

        <Grow in timeout={600}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CodeIcon sx={{ fontSize: 16, mr: 1, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">
                Generated SQL:
              </Typography>
            </Box>
            <Box
              sx={{
                fontSize: "13px",
                background: "rgba(96, 165, 250, 0.05)",
                color: "primary.light",
                padding: "14px",
                borderRadius: "8px",
                fontFamily: "monospace",
                border: "1px solid rgba(96, 165, 250, 0.2)",
                overflow: "auto",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(96, 165, 250, 0.1)",
                },
              }}
            >
              {query}
            </Box>
          </Box>
        </Grow>

        <Divider sx={{ my: 3, borderColor: "rgba(96, 165, 250, 0.1)" }} />

        {results.length === 0 ? (
          <Fade in timeout={500}>
            <Alert
              severity="info"
              sx={{
                backgroundColor: "rgba(96, 165, 250, 0.1)",
                border: "1px solid rgba(96, 165, 250, 0.3)",
              }}
            >
              No results found
            </Alert>
          </Fade>
        ) : (
          <Grow in timeout={700}>
            <TableContainer
              sx={{
                maxHeight: 500,
                borderRadius: "8px",
                border: "1px solid rgba(96, 165, 250, 0.2)",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(15, 23, 42, 0.5)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(96, 165, 250, 0.3)",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "rgba(96, 165, 250, 0.5)",
                  },
                },
              }}
            >
              <Table stickyHeader size="small">
                <TableHead
                  sx={{
                    "& .MuiTableCell-root": {
                      bgcolor: "rgba(15, 23, 42, 0.98)", // solid dark
                      color: "primary.light",
                      fontWeight: 700,
                      borderBottom: "2px solid rgba(96, 165, 250, 0.3)",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.5px",
                      zIndex: 2, // keep above body
                    },
                  }}
                >
                  {" "}
                  <TableRow>
                    {results &&
                      results.length > 0 &&
                      Object.keys(results[0]).map((column) => (
                        <TableCell
                          key={column}
                          sx={{
                            fontWeight: 700,
                            bgcolor: "rgba(96, 165, 250, 0.1)",
                            color: "primary.light",
                            borderBottom: "2px solid rgba(96, 165, 250, 0.3)",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {column}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results &&
                    results.length > 0 &&
                    results.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(96, 165, 250, 0.05)",
                          },
                        }}
                      >
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            sx={{
                              borderBottom: "1px solid rgba(96, 165, 250, 0.1)",
                            }}
                          >
                            {value === null ? (
                              <em
                                style={{
                                  color: "#94a3b8",
                                  fontStyle: "italic",
                                }}
                              >
                                NULL
                              </em>
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
          </Grow>
        )}
      </Paper>
    </Fade>
  );
}

export default ResultsTable;
