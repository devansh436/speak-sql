import { createTheme } from "@mui/material/styles";

// A warm, dark neutral palette (no blue/purple gradients) with a single
// restrained accent color, in the spirit of Claude's own product UI.
const colors = {
  // Backgrounds
  bg: "#111315", // Main background
  surface: "#1A1D20", // Cards, Paper
  surfaceRaised: "#23272B", // Hover / Elevated cards
  surfaceSunken: "#0D0F11", // Inputs, code blocks

  // Borders
  border: "#32373C",
  borderStrong: "#454B51",

  // Primary (Emerald)
  accent: "#22C55E",
  accentDark: "#16A34A",
  accentLight: "#86EFAC",

  // Secondary (Amber)
  sage: "#F59E0B",

  // Typography
  textPrimary: "#F5F7FA",
  textSecondary: "#B2BAC2",
  textMuted: "#7B848E",

  // Status
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#38BDF8",
};

// Reusable, low-opacity accent tints. Used instead of gradients to add
// depth — a flat wash of color plus a hairline border reads as considered,
// not decorative.
const tint = (hex, alpha) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.accent,
      dark: colors.accentDark,
      light: colors.accentLight,
      contrastText: "#08120C",
    },
    secondary: {
      main: colors.sage,
      contrastText: "#1A1202",
    },
    success: { main: colors.success },
    error: { main: colors.error },
    warning: { main: colors.warning },
    info: { main: colors.info },
    background: {
      default: colors.bg,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textMuted,
    },
    divider: colors.border,
    action: {
      hover: tint(colors.accent, 0.06),
      selected: tint(colors.accent, 0.1),
    },
  },
  custom: colors,
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.015em" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600, letterSpacing: "-0.005em" },
    subtitle1: { color: colors.textSecondary },
    subtitle2: { fontWeight: 700 },
    body2: { color: colors.textSecondary },
    button: { fontWeight: 600 },
    caption: { color: colors.textMuted },
    overline: {
      color: colors.textMuted,
      letterSpacing: "0.08em",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg,
          scrollbarColor: `${colors.borderStrong} ${colors.bg}`,
        },
        "*::-webkit-scrollbar": { width: 10, height: 10 },
        "*::-webkit-scrollbar-track": { background: colors.bg },
        "*::-webkit-scrollbar-thumb": {
          background: colors.borderStrong,
          borderRadius: 8,
          border: `2px solid ${colors.bg}`,
        },
        "*::-webkit-scrollbar-thumb:hover": { background: colors.accent },
        "*:focus-visible": {
          outline: `2px solid ${colors.accent}`,
          outlineOffset: "2px",
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.surface,
        },
        outlined: {
          borderColor: colors.border,
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: tint(colors.surface, 0.86),
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          transition: "border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          borderRadius: 8,
          letterSpacing: "0.01em",
          transition: "background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
        },
        sizeLarge: {
          padding: "10px 24px",
          fontSize: "0.95rem",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 6px 20px ${tint(colors.accent, 0.28)}`,
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        outlined: {
          borderColor: colors.border,
          borderWidth: "1.5px",
          "&:hover": {
            borderColor: colors.accent,
            borderWidth: "1.5px",
            backgroundColor: tint(colors.accent, 0.08),
          },
        },
        text: {
          "&:hover": { backgroundColor: tint(colors.accent, 0.08) },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "background-color 140ms ease, color 140ms ease",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 7 },
        outlined: {
          borderColor: colors.border,
        },
        clickable: {
          transition: "border-color 140ms ease, background-color 140ms ease, color 140ms ease",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${colors.border}`,
          padding: "10px",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 120ms ease",
          "&.MuiTableRow-hover:hover": {
            backgroundColor: tint(colors.accent, 0.055),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: "0.07em",
          color: colors.textSecondary,
          backgroundColor: colors.surfaceRaised,
          borderBottom: `1px solid ${colors.borderStrong}`,
          borderRight: `1px solid ${colors.borderStrong}`,
          whiteSpace: "nowrap",
        },
        root: {
          borderBottom: `1px solid ${colors.border}`,
          borderRight: `1px solid ${colors.border}`,
          padding: "13px 18px",
          fontSize: "0.875rem",
          "&:last-of-type": {
            borderRight: "none",
          },
        },
        sizeSmall: {
          padding: "10px 16px",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderBottom: "none",
          color: colors.textSecondary,
        },
        selectLabel: { color: colors.textMuted, fontSize: "0.8rem" },
        displayedRows: { color: colors.textSecondary, fontSize: "0.8rem" },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2.5,
          borderRadius: "3px 3px 0 0",
          backgroundColor: colors.accent,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          transition: "color 140ms ease",
          "&.Mui-selected": { color: colors.accent },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "medium" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surfaceSunken,
          borderRadius: 9,
          transition: "box-shadow 140ms ease, border-color 140ms ease",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.borderStrong,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.accent,
            borderWidth: "1.5px",
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3.5px ${tint(colors.accent, 0.14)}`,
          },
        },
        notchedOutline: {
          borderColor: colors.border,
          transition: "border-color 140ms ease",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": { color: colors.accent },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 9 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: colors.surfaceRaised,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: "2px 6px",
          fontSize: "0.875rem",
          "&:hover": { backgroundColor: tint(colors.accent, 0.08) },
          "&.Mui-selected": {
            backgroundColor: tint(colors.accent, 0.14),
            "&:hover": { backgroundColor: tint(colors.accent, 0.18) },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.surfaceRaised,
          border: `1px solid ${colors.border}`,
          color: colors.textPrimary,
          fontSize: "0.72rem",
          fontWeight: 500,
          padding: "6px 10px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.border },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: { bottom: { xs: 16, sm: 24 } },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { border: "1px solid transparent", borderRadius: 9 },
        standardError: {
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          borderColor: "rgba(239, 68, 68, 0.30)",
          color: "#FECACA",
        },

        standardSuccess: {
          backgroundColor: "rgba(34, 197, 94, 0.12)",
          borderColor: "rgba(34, 197, 94, 0.30)",
          color: "#BBF7D0",
        },

        standardInfo: {
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          borderColor: "rgba(56, 189, 248, 0.30)",
          color: "#BAE6FD",
        },

        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.12)",
          borderColor: "rgba(245, 158, 11, 0.30)",
          color: "#FDE68A",
        },
      },
    },
  },
});

export default darkTheme;