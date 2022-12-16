import Badge from "@mui/material/Badge";
import HomeIcon from "@mui/icons-material/Home";
import TodayIcon from "@mui/icons-material/Today";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

const pages = {
  Home: <HomeIcon />,
  Review: (
    <Badge
      color="error"
      // TODO: use state
      badgeContent={99}
    >
      <TodayIcon />
    </Badge>
  ),
  Library: <LocalLibraryIcon />,
};
export { pages };
