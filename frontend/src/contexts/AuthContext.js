import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});
const API_CHECK_AUTH = "/api/auth-check/";
/**
 * A custom hook that retrieve AuthContext
 * @returns {auth, setAuth}
 */
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    let checkAuth = async () => {
      try {
        let response = await axios.get(API_CHECK_AUTH);
        console.log(response);
        setAuth(true);
      } catch (e) {
        console.log(e);
        setAuth(false);
      }
    };
    checkAuth();
  });

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
