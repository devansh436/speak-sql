import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon /> },
    { path: "/tables", label: "Tables", icon: <StorageIcon /> },
  ];
  // If admin, add admin item (ensure no duplicate path!)
  if (
    user?.role === "ADMIN" &&
    !navItems.some((item) => item.path === "/admin")
  ) {
    navItems.push({
      path: "/admin",
      label: "Admin",
      icon: <AdminPanelSettingsIcon />,
    });
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "STAFF":
        return "warning";
      case "USER":
        return "success";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return "🧑‍💻";
      case "STAFF":
        return "🧑‍💼";
      case "USER":
        return "👤";
      default:
        return "👤";
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
      style={{ borderRadius: "0" }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton>
              <img
                src="/image.png"
                alt="icon"
                style={{ width: 30, height: 30 }}
              />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textDecoration: "none",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              SpeakSQL
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color:
                    location.pathname === item.path
                      ? "primary.main"
                      : "text.secondary",
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  bgcolor:
                    location.pathname === item.path
                      ? "rgba(96, 165, 250, 0.1)"
                      : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(96, 165, 250, 0.15)",
                    color: "primary.main",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            {isAuthenticated ? (
              <>
                <Chip
                  label={`${getRoleIcon(user?.role)} ${user?.role}`}
                  color={getRoleColor(user?.role)}
                  size="small"
                  sx={{ ml: 2 }}
                />
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ color: "primary.main" }}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">
                      {user?.username} ({user?.email})
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                startIcon={<LoginIcon />}
                variant="contained"
                size="small"
                sx={{ ml: 2 }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
