import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import {
  UserMenuInfoSection,
  userMenuDataSection,
  userMenuActionSection,
} from "./user-menu-items";

function UserDrawer({ userInfo, openDrawer, handleCloseDrawer }) {
  return (
    <Drawer
      anchor="right"
      open={openDrawer}
      onClose={handleCloseDrawer}
      container={document.getElementById("root")}
    >
      <UserMenuInfoSection userInfo={userInfo} />
      <List sx={{ width: 250 }}>
        {userMenuDataSection.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        {userMenuActionSection.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default UserDrawer;
