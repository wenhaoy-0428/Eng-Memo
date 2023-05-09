import React from "react";

import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import withUserItems, { UserMenuInfoSection } from "./user-menu-hoc";

/**
 * The UserDrop down component that is only visibly in Desktop view.
 * This includes a userAvatar and dropDown menu.
 * @param userInfo: The prop that contains user information.
 */
function UserDropDown({
  userMenuDataSection,
  userMenuActionSection,
  userInfo,
  anchorElUser,
  handleCloseDropdown,
}) {
  return (
    <Menu
      anchorEl={anchorElUser}
      open={Boolean(anchorElUser)}
      onClose={handleCloseDropdown}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          minWidth: 200,
          // tip
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      // ! By default the container is document.body which is outside of the React container,
      // ! thus TailwindCSS is not applied
      // Refer to: https://github.com/mui/material-ui/issues/33017
      container={document.getElementById("root")}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <UserMenuInfoSection userInfo={userInfo} />
      {userMenuDataSection.map((item) => (
        <MenuItem key={item.label} onClick={item.onclick}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          {item.label}
        </MenuItem>
      ))}
      <Divider />
      {userMenuActionSection.map((item) => (
        <MenuItem key={item.label} onClick={item.onclick}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default withUserItems(UserDropDown);
