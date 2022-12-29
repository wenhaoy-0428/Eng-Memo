import { render, screen, waitFor } from "src/test-utils";
import NavBarTop from "../NavBar-Top";
import NavBarBottom from "../NavBar-Bottom";
import App from "../../../App";
import Review from "../../review/Review";
import Library from "../../library/Library";
import InputForm from "../../input-container/InputForm";
import user from "@testing-library/user-event";
import {
  Route,
  RouterProvider,
  createMemoryRouter,
  createRoutesFromElements,
} from "react-router-dom";

describe("NavBarTestSuite", () => {
  /**
   * @brief: Test buttons of NavBar Top
   * @exp: Review / Library / LOGO are appeared
   */
  it("NAV_BAR_TC_001", async () => {
    const userInfo = {
      name: "Ada",
      email: "ada@gmail.com",
      avatar: undefined,
    };
    const routes = [
      {
        path: "/",
        element: <NavBarTop pendingReviews={10} userInfo={userInfo} />,
      },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });

    render(<RouterProvider router={router} />);
    const review = screen.queryByRole("link", { name: "Review" });
    expect(review).toBeInTheDocument();
    const library = screen.queryByRole("link", { name: "Library" });
    expect(library).toBeInTheDocument();
  });

  /**
   * @brief: Test buttons of NavBarBottom
   * @exp: Review / Library / Home are appeared
   */
  it("NAV_BAR_TC_002", () => {
    const routes = [
      {
        path: "/",
        element: <NavBarBottom />,
      },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });

    render(<RouterProvider router={router} />);
    const review = screen.queryByRole("link", { name: "Review" });
    expect(review).toBeInTheDocument();
    const library = screen.queryByRole("link", { name: "Library" });
    expect(library).toBeInTheDocument();
  });
  /**
   * @brief: Test navigation functionality of NarBar
   * @exp: Navigation buttons bring users to corresponding pages.
   */
  it("NAV_BAR_TC_003", async () => {
    function fetchReview() {
      console.log("FETCH CALLED");
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

    const routes = createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route index element={<InputForm />} />
        <Route path="review" element={<Review />} loader={fetchReview} />
        <Route path="library" element={<Library />} />
      </Route>
    );

    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });
    render(<RouterProvider router={router} />);
    // Because CSS mediaQuery is not supported, we may have multiple nav items.
    const review = screen.queryAllByRole("link", { name: "Review" });
    expect(review[0]).toBeInTheDocument();
    expect(screen.queryByTestId("review-container")).toBeNull();
    user.click(review[0]);
    await waitFor(() => {
      expect(screen.getByTestId("review-container")).toBeInTheDocument();
    });
    const library = screen.queryAllByRole("link", { name: "Library" });
    expect(library[0]).toBeInTheDocument();
    expect(screen.queryByTestId("library-container")).toBeNull();
    user.click(library[0]);
    expect(screen.queryByTestId("library-container")).toBeInTheDocument();
  });
});
