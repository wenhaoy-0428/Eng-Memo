import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";

import TodayIcon from "@mui/icons-material/Today";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import GradingIcon from "@mui/icons-material/Grading";

import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

/**
 * @brief: A function that returns rendered Nav items.
 * @param handler: The handler function for onClick events
 * @return: An array of rendered items that calls the handler when clicked.
 */
const renderNavItems = (handler) => {
  const pages = {
    Review: <TodayIcon />,
    Library: <LocalLibraryIcon />,
  };
  const rendered = [];
  for (const name in pages) {
    const renderPage = (
      <Tooltip key={name} title={name}>
        <Button
          onClick={handler}
          sx={{ color: "white" }}
          className="my-1 inline-flex items-center justify-center"
        >
          {pages[name]}
        </Button>
      </Tooltip>
    );
    rendered.push(renderPage);
  }
  console.log(rendered);
  return rendered;
};

const settings = ["Profile", "Account", "Dashboard", "Logout"];

/**
 * @brief: The NavBar component that handles the routing of the App
 */
function NavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      {/*  centers your content horizontally. */}
      <Container
        maxWidth="xl"
        className="xs:grid xs:grid-cols-3 xs:justify-items-center md:flex md:items-center p-2"
      >
        {/* Icon on Desktop */}
        <div className="xs:hidden md:flex md: items-center">
          <AdbIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Desktop
          </Typography>
        </div>

        {/* Icon on Mobile */}
        <div className="xs:flex xs:items-center md:hidden col-start-2">
          <AdbIcon sx={{ mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Mobile
          </Typography>
        </div>

        {/* Nav-Items */}
        <Box
          className="xs:hidden md:flex md: items-center"
          sx={{ flexGrow: 1 }}
        >
          {renderNavItems(handleCloseNavMenu)}
        </Box>

        {/* UserAvatar */}
        <Box className="ml-auto">
          <Tooltip title="User Information">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
            </IconButton>
          </Tooltip>
          {/* DropDownMenu */}
          {/* //TODO MODIFY THIS */}
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={handleCloseUserMenu}>
                <Typography textAlign="center">{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Container>
    </AppBar>
  );
}
export { NavBar };
