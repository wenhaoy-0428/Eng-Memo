import Badge from "@mui/material/Badge";
import HomeIcon from "@mui/icons-material/Home";
import TodayIcon from "@mui/icons-material/Today";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import { useUser } from "../../contexts/UserContext";

const usePages = () => {
  const { user, _ } = useUser();

  return {
    Home: {
      icon: <HomeIcon />,
      path: "home",
    },
    Review: {
      icon: (
        <Badge color="error" max={999} badgeContent={user.numPendingReviews}>
          <TodayIcon />
        </Badge>
      ),
      path: "Review",
    },
    Library: {
      icon: <LocalLibraryIcon />,
      path: "Library",
    },
  };
};
export { usePages };
