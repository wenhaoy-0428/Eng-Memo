import { render, screen, waitFor } from "src/test-utils";
import NavBarTop from "../NavBar-Top";
import NavBarBottom from "../NavBar-Bottom";
import user from "@testing-library/user-event";

describe("NavBarTestSuite", () => {
  describe("NavBarTopTestSuite", () => {
    /**
     * @brief: Test NavBar Top on different screen sizes.
     * @exp: Have Page Items on Desktop; Have only a logo on Mobile.
     */
    it("NAV_BAR_TOP_TC_001", async () => {
      //   render(<NavBarTop />);
      //   expect(
      //     screen.getByRole("button", { name: "Review" })
      //   ).toBeInTheDocument();
      //   expect(
      //     screen.getByRole("button", { name: "Library" })
      //   ).toBeInTheDocument();
      //   expect(screen.queryByRole("button", { name: "Home" })).toBeNull();
      //   expect(screen.queryByTestId("logo-desktop")).toBeVisible();
      //   expect(screen.queryByTestId("logo-mobile")).not.toBeVisible();
    });
  });

  //   describe("NavBarBottomTestSuite", () => {
  //     /**
  //      * @brief: Test NavBar-Bottom on difference screen sizes.
  //      * @exp:
  //      */
  //     it("NAV_BAR_BOTTOM_TC_001", () => {
  //       render(<NavBarBottom />);
  //       console.log(window.innerWidth);
  //       expect(screen.getByTestId("nav-bar-bottom")).not.toBeVisible();
  //       window.innerWidth = 480;
  //       window.dispatchEvent(new Event("resize"));

  //       // https://stackoverflow.com/questions/60396600/set-size-of-window-in-jest-and-jest-dom-and-jsdom
  //       expect(window.innerWidth).toBe(480);
  //       expect(screen.getByTestId("nav-bar-bottom")).not.toBeVisible();
  //       expect(
  //         screen.getByRole("button", { name: "/[.*]Review/i" })
  //       ).toBeVisible();
  //       //   expect(screen.ByLabelText("Library")).toBeNull();
  //       //   expect(screen.queryByLabelText("Home")).toBeNull();
  //     });
  //   });
});
