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
  Divider,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../context/AuthContext";

const ROLE_META = {
  ADMIN: {
    color: "error",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
  },
  STAFF: { color: "warning", icon: <BadgeIcon sx={{ fontSize: 16 }} /> },
  USER: { color: "success", icon: <PersonIcon sx={{ fontSize: 16 }} /> },
};

function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon fontSize="small" /> },
    {
      path: "/tables",
      label: "Tables",
      icon: <StorageIcon fontSize="small" />,
    },
    { path: "/docs", label: "Docs", icon: <MenuBookIcon fontSize="small" /> },
  ];
  if (user?.role === "ADMIN") {
    navItems.push({
      path: "/admin",
      label: "Admin",
      icon: <AdminPanelSettingsIcon fontSize="small" />,
    });
  }

  const roleMeta = ROLE_META[user?.role] || ROLE_META.USER;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", py: 1, gap: 2 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "text.primary",
            }}
          >
            <Box
              component="img"
              src="/icon.svg"
              alt="SpeakSQL Logo"
              sx={{
                width: 32,
                height: 32,
              }}
            />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              SpeakSQL
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    px: 1.5,
                    color: active ? "primary.main" : "text.secondary",
                    fontWeight: active ? 700 : 500,
                    borderRadius: 0,
                    borderBottom: "2px solid",
                    borderColor: active ? "primary.main" : "transparent",
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {isAuthenticated ? (
              <>
                <Chip
                  icon={roleMeta.icon}
                  label={user?.role}
                  color={roleMeta.color}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 2 }}
                />
                <IconButton
                  onClick={handleMenuOpen}
                  aria-label="Account menu"
                  sx={{ color: "text.secondary", ml: 0.5 }}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled sx={{ opacity: "1 !important" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {user?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Log out
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
                Log in
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
