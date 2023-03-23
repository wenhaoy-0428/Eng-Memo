import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import Review from "./components/review/Review";
import Library from "./components/library/Library";
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

/**
 * A Mock data fetcher.
 */
function fetchMock() {
  return {
    library: [
      {
        word: "Flaky",
        quote:
          "Manual mocks are used to stub out functionality with mock data. \
                For example, instead of accessing a remote resource like a website or a database, \
                you might want to create a manual mock that allows you to use fake data. \
                This ensures your tests will be fast and not flaky.",
        tag: "Jest-Manual-Mocks",
        rLink: "https://jestjs.io/docs/manual-mocks",
      },
      {
        word: "In tandem with",
        quote:
          "To build for the web, developers use React in tandem with ReactDOM. \
                React and ReactDOM are often discussed in the same spaces as — and utilized to solve \
                the same problems as — other true web development frameworks.",
        tag: "MDN-React",
        rLink:
          "https://dictionary.cambridge.org/dictionary/english-chinese-simplified/in-tandem",
      },
      {
        word: "Superfluous",
        quote:
          "We will however be avoiding any superfluous tooling, with the aim of keeping complexity to a minimum.",
        tag: "MDN-Toolchain",
        rLink:
          "https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Introducing_complete_toolchain#toolchains_and_their_inherent_complexity",
      },
    ],
  };
}

function fetchReview() {
  return [
    {
      key: "Word",
      occurrences: [
        {
          quote: "QuoteA",
          tag: "TAG1",
          link: "#",
        },
        {
          quote: "QuoteA+",
          tag: "TAG1",
          link: "#",
        },
        {
          quote:
            "QuoteB QuoteB ABC 123 ABC ABC ABC ABC 345 ABC ABC ABC ABC ABC 789  ABC 123 ABC ABC ABC ABC 345 ABC ABC ABC ABC ABC 789 ABC 123 ABC ABC ABC ABC 345 ABC ABC ABC ABC ABC 789  ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ABC ",
          tag: "TAG2",
          link: "#",
        },
        {
          quote: "QuoteC",
          tag: undefined,
          link: "#",
        },
        {
          quote: "QuoteD",
          tag: "TAG3",
          link: undefined,
        },
      ],
    },
    {
      key: "Another",
      occurrences: [
        {
          quote: "QuoteA",
          tag: "TAG1",
          link: "#",
        },
      ],
    },
  ];
}

function loadReview() {
  return axios.get("/api/getReview/");
}

const router = createBrowserRouter(
  createRoutesFromElements(
    // TODO: root should be log in page
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route index element={<InputForm />} />
      <Route path="review" element={<Review />} loader={loadReview} />
      <Route path="library" element={<Library />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
