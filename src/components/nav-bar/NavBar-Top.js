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
import { Link } from "react-router-dom";

import { getPages } from "./NavItems";

const settings = ["Profile", "Account", "Dashboard", "Logout"];
const navItems = ["Review", "Library"];

/**
 * @brief: The NavBar component that handles the routing of the App
 * @param pendingReviews: The number of unfinished reviews
 */
function NavBarTop({ pendingReviews }) {
  // Todo: States clean up
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  // Initialize the available pages.
  const pages = getPages(pendingReviews);
  return (
    <AppBar position="static" role="navigation">
      {/*  centers your content horizontally. */}
      <Container
        maxWidth="xl"
        className="xs:grid xs:grid-cols-3 xs:justify-items-center md:flex md:items-center p-2"
      >
        {/* Icon on Desktop */}
        <div
          data-testid="logo-desktop"
          className="xs:hidden md:flex md: items-center"
        >
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
        <div
          data-testid="logo-mobile"
          className="xs:flex xs:items-center md:hidden col-start-2"
        >
          <AdbIcon sx={{ mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
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
          {navItems.map((item) => (
            <Tooltip title={item} key={item}>
              <Button
                aria-label={item}
                component={Link}
                to={pages[item].path}
                sx={{ color: "white" }}
                className="my-1 inline-flex items-center justify-center"
              >
                {pages[item].icon}
              </Button>
            </Tooltip>
          ))}
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
export default NavBarTop;
