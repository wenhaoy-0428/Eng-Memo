import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App, { loadApp } from "./App";
import Review, { loadReview } from "./components/review/Review";
import Library, { loadLibrary } from "./components/library/Library";
import InputForm from "./components/input-container/InputForm";
import ErrorPage from "./error-page";
import Register from "./components/authentication/registration/RegisterPage";
import Login from "./components/authentication/login/LoginPage";

import { PrivateRoutes, loadCSRFToken } from "./libs/auth/auth";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { UserProvider } from "./contexts/UserContext";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
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
        >
          <Route path="home" element={<InputForm />} />
          <Route path="review" element={<Review />} loader={loadReview} />
          <Route path="library" element={<Library />} loader={loadLibrary} />
        </Route>
      </Route>
      <Route path="account/*" loader={loadCSRFToken}>
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Route>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </AuthProvider>
);
