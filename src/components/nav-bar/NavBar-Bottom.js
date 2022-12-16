import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { pages } from "./NavItems";

function NavBarBottom() {
  // value prop in BottomNavigation. Used for indicating the current selected button.
  const [value, setValue] = React.useState("Home");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      className="NarBarBottom row-start-6 self-end md:hidden w-full bg-slate-50"
    >
      <BottomNavigationAction label="Home" value="Home" icon={pages["Home"]} />
      <BottomNavigationAction
        label="Review"
        value="Review"
        icon={pages["Review"]}
      />
      <BottomNavigationAction
        label="Library"
        value="Library"
        icon={pages["Library"]}
      />
    </BottomNavigation>
  );
}

export default NavBarBottom;
