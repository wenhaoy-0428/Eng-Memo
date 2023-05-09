import React from "react";
import axios from "axios";
import { Navigate, Outlet, redirect } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import LinearProgress from "@mui/material/LinearProgress";

const API_GET_CSRF_TOKEN = "/api/auth-get-csrf-token/";
const API_CHECK_AUTH = "/api/auth-check/";

/**
 * sets CSRF Token inside cookie which allows subsequent axios requests to have CSRF token
 * @returns null
 */
export async function loadCSRFToken() {
  try {
    await axios.get(API_GET_CSRF_TOKEN);
  } catch (e) {
    console.log(e);
  }
  return null;
}

export const PrivateRoutes = () => {
  const { auth } = useAuth();
  // render loading page if authentication is not yet checked
  if (auth === null) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <div className="w-[30%] max-w-[300px]">
          <LinearProgress />
        </div>
      </div>
    );
  }
  return auth ? <Outlet /> : <Navigate to="/account/login" />;
};

/**
 * loader function that tries to check authentication before render and redirect page if necessary
 * @returns null if authenticated and redirect otherwise
 * @deprecated
 */
const loadPrivate = async () => {
  try {
    let response = await axios.get(API_CHECK_AUTH);
    return null;
  } catch (e) {
    console.log(e);
  }
  return redirect("/account/login");
};
