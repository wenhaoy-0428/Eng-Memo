import NavBarTop from "./components/nav-bar/NavBar-Top";
import NavBarBottom from "./components/nav-bar/NavBar-Bottom";
import { useLoaderData, Outlet } from "react-router-dom";
import React, { useState } from "react";

function App() {
  // The data fetched from server including user Information and library
  const data = useLoaderData();
  // The number of unfinished reviews
  const [pendingReviews, setPendingReviews] = useState(100);
  const userInfo = {
    name: "Ada",
    email: "ada@gmail.com",
    avatar: undefined,
  };

  return (
    <div className="App grid grid-rows-6 grid-flow-col items-start justify-items-center h-screen">
      <NavBarTop pendingReviews={pendingReviews} userInfo={userInfo} />
      <Outlet />
      <NavBarBottom pendingReviews={pendingReviews} />
    </div>
  );
}

export default App;
