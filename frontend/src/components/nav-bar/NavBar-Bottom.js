import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { getPages } from "./NavItems";
import { Link } from "react-router-dom";

const navItems = ["Home", "Review", "Library"];
/**
 * The bottom navigation component
 * @param pendingReviews: The number of unfinished reviews
 */
function NavBarBottom({ pendingReviews }) {
  // value prop in BottomNavigation. Used for indicating the current selected button.
  const [value, setValue] = React.useState("Home");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  // Initialize pages config
  const pages = getPages(pendingReviews);

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      className="NarBarBottom row-start-6 self-end md:hidden w-full bg-slate-50"
    >
      {navItems.map((item) => (
        <BottomNavigationAction
          key={item}
          label={item}
          value={item}
          icon={pages[item].icon}
          component={Link}
          to={pages[item].path}
        />
      ))}
    </BottomNavigation>
  );
}

export default NavBarBottom;
