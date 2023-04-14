import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AdbIcon from "@mui/icons-material/Adb";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import useMediaQuery from "@mui/material/useMediaQuery";

import { Link } from "react-router-dom";

import { getPages } from "./NavItems";
import UserDropDown from "../user/user-dropdown";
import UserDrawer from "../user/user-drawer";

const settings = ["Profile", "Account", "Dashboard", "Logout"];
const navItems = ["Review", "Library"];

/**
 * @brief: The NavBar component that handles the routing of the App
 * @param pendingReviews: The number of unfinished reviews
 * @param userInfo: The user information including userName and email, etc.
 */
function NavBarTop({ pendingReviews, userInfo }) {
  // Initialize the available pages.
  const pages = getPages(pendingReviews);
  const matches = useMediaQuery("(min-width:768px)");
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleCloseDropdown = (event) => {
    console.log("close Drop down");
    setAnchorElUser(null);
  };
  const handleCloseDrawer = () => {
    console.log("close drawer");
    setOpenDrawer(false);
  };

  const openUserMenu = (event) => {
    console.log("toggle UserMenu");
    // Open DropDown in desktop view
    if (matches) {
      setAnchorElUser(event.currentTarget);
    } else {
      // Open drawer in mobile view
      setOpenDrawer(true);
    }
  };

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
        <Box className="UserMenu ml-auto">
          <Tooltip title="User Information">
            <IconButton onClick={openUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Undefined" src={userInfo.avatar} />
            </IconButton>
          </Tooltip>
          <UserDropDown
            userInfo={userInfo}
            anchorElUser={anchorElUser}
            handleCloseDropdown={handleCloseDropdown}
          />

          <UserDrawer
            userInfo={userInfo}
            openDrawer={openDrawer}
            handleCloseDrawer={handleCloseDrawer}
          />
        </Box>
      </Container>
    </AppBar>
  );
}
export default NavBarTop;
