import React, { useEffect, useState } from "react";
import axios from "axios";

import NavBarTop from "./components/nav-bar/NavBar-Top";
import NavBarBottom from "./components/nav-bar/NavBar-Bottom";

import { useLoaderData, Outlet } from "react-router-dom";

import { useUser } from "./contexts/UserContext";

function App() {
  // The data fetched from server including user Information and library
  const data = useLoaderData();

  const userInfo = {
    name: data["username"],
    email: data["email"],
    avatar: data["avatar"],
    milestone_streak: data["streak"],
    milestone_longestStreak: data["longestStreak"],
    milestone_total: data["total"],
    numPendingReviews: data["numPending"],
  };
  const { user, setUser } = useUser();

  useEffect(() => {
    setUser(userInfo);
  }, []);

  return user ? (
    <div className="App grid grid-rows-6 grid-flow-col items-start justify-items-center h-full">
      <NavBarTop userInfo={userInfo} />
      <Outlet />
      <NavBarBottom />
    </div>
  ) : null;
}

export async function loadApp() {
  try {
    let response = await axios.post("/api/generateReviewPlan/");
    response = await axios.get("/api/getUserContext/");
    return response.data;
  } catch (e) {
    console.log(e);
  }

  return null;
}

export default App;
