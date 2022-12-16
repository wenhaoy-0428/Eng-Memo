import { render, screen, prettyDOM } from "src/test-utils";
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
    const routes = [
      {
        path: "/",
        element: <NavBarTop />,
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
  it("NAV_BAR_TC_003", () => {
    const routes = createRoutesFromElements(
      <Route
        path="/"
        element={<App />}
        // errorElement={<ErrorPage />}
        // loader={fetchMock}
      >
        <Route index element={<InputForm />} />
        <Route path="review" element={<Review />} />
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
    expect(screen.queryByTestId("review-container")).toBeInTheDocument();
    const library = screen.queryAllByRole("link", { name: "Library" });
    expect(library[0]).toBeInTheDocument();
    expect(screen.queryByTestId("library-container")).toBeNull();
    user.click(library[0]);
    expect(screen.queryByTestId("library-container")).toBeInTheDocument();
  });
});
