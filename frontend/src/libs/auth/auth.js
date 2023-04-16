import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet, redirect } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

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
    console.log(response);
    return null;
  } catch (e) {
    console.log(e);
  }
  return redirect("/account/login");
};
