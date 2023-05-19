import React from "react";

import Avatar from "@mui/material/Avatar";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import InsightsIcon from "@mui/icons-material/Insights";

import { Navigate, useNavigate } from "react-router-dom";

import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";

const API_LOGOUT = "/api/account/logout/";

export function UserMenuInfoSection() {
  const { user } = useUser();

  return (
    <div className="UserInfo px-3 w-full mb-2">
      <div className="m-0 w-40 whitespace-nowrap overflow-hidden text-ellipsis text-xl text-[#1976d2] font-extrabold text-center">
        {user.name}
      </div>
      <p className="m-0 ">{user.email}</p>
    </div>
  );
}

/**
 * A Higher Order Component that pushes UserItems into the original component
 * @param {*} OriginalComponent
 * @returns An Enhanced component with UserItems pushed in.
 */
function withUserItems(OriginalComponent) {
  return function (props) {
    // AuthContext
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    // The available Info related buttons in user menu
    const userMenuDataSection = [
      {
        label: "Profile",
        icon: <Avatar className="w-[1.5em] h-[1.5em] ml-[-5px]" />,
        onclick: () => {
          navigate("/profile");
        },
      },
      {
        label: "MileStone",
        icon: <InsightsIcon fontSize="small" />,
        onclick: () => {
          navigate("/milestone");
        },
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
        onclick: () => {
          axios
            .post(API_LOGOUT)
            .then(() => {
              setAuth(false);
            })
            .catch((e) => {
              console.log(e);
            });
        },
      },
    ];

    return (
      <OriginalComponent userMenuDataSection={userMenuDataSection} userMenuActionSection={userMenuActionSection} {...props} />
    );
  };
}

export default withUserItems;
