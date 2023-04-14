import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import withUserItems, { UserMenuInfoSection } from "./user-menu-hoc";

function UserDrawer({
  userMenuDataSection,
  userMenuActionSection,
  userInfo,
  openDrawer,
  handleCloseDrawer,
}) {
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
            <ListItemButton onClick={item.onclick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        {userMenuActionSection.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={item.onclick}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default withUserItems(UserDrawer);
