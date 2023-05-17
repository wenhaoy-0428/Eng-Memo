import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet,
  useNavigation,
} from "react-router-dom";

import axios from "axios";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";

import "./index.css";
import App, { loadApp } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorPage from "./error-page";
import InputForm from "./components/input-container/InputForm";
import Library, { loadLibrary } from "./components/library/Library";
import Login from "./components/authentication/login/LoginPage";
import LoadingIndicator from "./components/common/loadingIndicator/LoadingIndicator";
import { NotificationProvider } from "./contexts/NotificationContext";
import Review, { loadReview } from "./components/review/Review";
import Register from "./components/authentication/registration/RegisterPage";
import { PrivateRoutes, loadCSRFToken } from "./libs/auth/auth";
import Profile from "./components/profile";
import { UserProvider } from "./contexts/UserContext";
import MileStone, { loadMilestone } from "./components/calendar";
import { ThemeProvider, createTheme } from "@mui/material";

// solve csrf token missing error when POSTing data to Django
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

// a threshold in ms only longer than which the request takes, will loading screen appear
const LOADING_APPEARANCE_THRESHOLD = 500;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Index />}>
      <Route path="/" element={<Navigate to={"/home"} />} />
      <Route element={<PrivateRoutes />}>
        <Route
          path="/*"
          element={
            <UserProvider>
              <App />
            </UserProvider>
          }
          loader={loadApp}
          errorElement={<ErrorPage />}
          shouldRevalidate={() => {
            // only call loader on mount
            return false;
          }}
        >
          <Route path="home" element={<InputForm />} />
          <Route path="review" element={<Review />} loader={loadReview} />
          <Route path="library" element={<Library />} loader={loadLibrary} />
          <Route path="milestone">
            <Route index element={<Navigate replace to={`${format(new Date(), "yyyy-MM-dd")}`} />} />
            <Route path=":date" element={<MileStone />} loader={loadMilestone} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="account/*" loader={loadCSRFToken}>
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Route>
    </Route>
  )
);

function Index() {
  // hook that tells the current state of ReactRouting which can be used to determine if the
  // App is loading/submitting anything
  const navigation = useNavigation();
  // switch that controls the appearance of LoadingIndicator
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  // A time that stores the id of potential task to show LoadingIndicator
  const [prevTimer, setPrevTimer] = useState(undefined);

  /**
   * Fire the side effect whenever state of navigation is changed.
   * Set a timer to show loadingIndicator, which can be canceled anytime state of navigation changed again before
   * the delay is reached.
   */
  useEffect(() => {
    if (navigation.state !== "idle") {
      const timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, LOADING_APPEARANCE_THRESHOLD);
      setPrevTimer(timer);
      return () => clearTimeout(timer);
    } else {
      // clear the timer when the app is no longer loading before threshold is reached
      setShowLoadingIndicator(false);
      clearTimeout(prevTimer);
    }
  }, [navigation.state]);

  return (
    <>
      <AnimatePresence>{showLoadingIndicator && <LoadingIndicator />}</AnimatePresence>
      <Outlet />
    </>
  );
}

const theme = createTheme({
  palette: {
    success: {
      main: "#4CAF50",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </ThemeProvider>
  </AuthProvider>
);
