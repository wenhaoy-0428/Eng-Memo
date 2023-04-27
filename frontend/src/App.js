import NavBarTop from "./components/nav-bar/NavBar-Top";
import NavBarBottom from "./components/nav-bar/NavBar-Bottom";
import { useLoaderData, Outlet } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

function App() {
  // The data fetched from server including user Information and library
  const data = useLoaderData();
  // The number of unfinished reviews
  const [pendingReviews, setPendingReviews] = useState(data["numPending"]);

  const userInfo = {
    name: "Ada",
    email: "ada@gmail.com",
    avatar: undefined,
  };

  return (
    <div className="App grid grid-rows-6 grid-flow-col items-start justify-items-center h-screen">
      <NavBarTop pendingReviews={pendingReviews} userInfo={userInfo} />
      <Outlet context={[setPendingReviews]} />
      <NavBarBottom pendingReviews={pendingReviews} />
    </div>
  );
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
