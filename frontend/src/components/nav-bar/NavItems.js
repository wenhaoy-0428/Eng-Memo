import Badge from "@mui/material/Badge";
import HomeIcon from "@mui/icons-material/Home";
import TodayIcon from "@mui/icons-material/Today";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

const getPages = (pendingReviews) => ({
  Home: {
    icon: <HomeIcon />,
    path: "/",
  },
  Review: {
    icon: (
      <Badge color="error" max={999} badgeContent={pendingReviews}>
        <TodayIcon />
      </Badge>
    ),
    path: "Review",
  },
  Library: {
    icon: <LocalLibraryIcon />,
    path: "Library",
  },
});
export { getPages };
