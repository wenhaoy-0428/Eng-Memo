import { render } from "@testing-library/react";
import fs from "fs";

/**
 * This function is meant to wrap rendered UI from RTL render into a div with id root.
 * In this project, Material UI are used in combine with Tailwind, which requires `#root` importance before
 * every component (check /tailwind.config.js). Thus, the compiled Tailwind CSS will have all rules with #root in front.
 */
const Root = ({ children }) => {
  return <div id="root">{children}</div>;
};

/**
 * This is custom render in place of render from RTL to support Tailwind in testing.
 * The **compiled** tailwind css is injected to jdDom via a style element to head.
 * The `npm test` is configured to compile TailwindCSS into normal css in every run.
 * https://stackoverflow.com/questions/71010317/react-testing-library-cant-read-styles-using-tailwind-css-classes
 * @param {*} ui: UI is simply forwarded to RTL render
 * @param {*} options: Options are simply forwarded to RTL render.
 * @returns result from RTL render.
 */
const customRender = (ui, options) => {
  const view = render(ui, { wrapper: Root, ...options });
  const style = document.createElement("style");
  style.innerHTML = fs.readFileSync("src/index-compiled.css", "utf8");
  document.head.appendChild(style);
  return view;
};

export * from "@testing-library/react";
export { customRender as render };
