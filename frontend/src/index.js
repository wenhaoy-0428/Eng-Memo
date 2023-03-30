import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import Review, { loadReview } from "./components/review/Review";
import Library, { loadLibrary } from "./components/library/Library";
import InputForm from "./components/input-container/InputForm";
import ErrorPage from "./error-page";

import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

import axios from "axios";

const router = createBrowserRouter(
  createRoutesFromElements(
    // TODO: root should be log in page
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route index element={<InputForm />} />
      <Route path="review" element={<Review />} loader={loadReview} />
      <Route path="library" element={<Library />} loader={loadLibrary} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
