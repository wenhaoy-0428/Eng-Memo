import React, { useEffect, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import InsightsIcon from "@mui/icons-material/Insights";

import { Navigate } from "react-router-dom";

import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const API_LOGOUT = "/api/account/logout/";

export function UserMenuInfoSection({ userInfo }) {
  return (
    <div className="UserInfo p-3 w-[10px] block">
      <h4 className="m-0 w-40 whitespace-nowrap overflow-hidden text-ellipsis ">
        {userInfo.name}
      </h4>
      <p className="m-0 ">{userInfo.email}</p>
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

    return auth ? (
      <OriginalComponent
        userMenuDataSection={userMenuDataSection}
        userMenuActionSection={userMenuActionSection}
        {...props}
      ></OriginalComponent>
    ) : (
      <Navigate to={"/account/login"} />
    );
  };
}

export default withUserItems;
