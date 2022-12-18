import Avatar from "@mui/material/Avatar";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import InsightsIcon from "@mui/icons-material/Insights";

function UserMenuInfoSection({ userInfo }) {
  return (
    <div className="UserInfo p-3 w-[10px] block">
      <h4 className="m-0 w-40 whitespace-nowrap overflow-hidden text-ellipsis ">
        {userInfo.name}
      </h4>
      <p className="m-0 ">{userInfo.email}</p>
    </div>
  );
}
// The available Info related buttons in user menu
const userMenuDataSection = [
  {
    label: "Profile",
    // TODO
    icon: <Avatar className="w-[1.5em] h-[1.5em] ml-[-5px]" />,
  },
  {
    label: "MileStone",
    icon: <InsightsIcon fontSize="small" />,
  },
];

// The available Action related buttons in user menu
const userMenuActionSection = [
  {
    label: "Settings",
    icon: <Settings fontSize="small" />,
  },
  {
    label: "Logout",
    icon: <Logout fontSize="small" />,
  },
];

export { UserMenuInfoSection, userMenuDataSection, userMenuActionSection };
