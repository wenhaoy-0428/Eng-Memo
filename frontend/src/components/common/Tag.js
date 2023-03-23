import React from "react";

const Tag = React.forwardRef(({ link, children }, ref) => (
  <a
    ref={ref}
    href={link}
    className="inline-block bg-green-500 p-2 no-underline rounded-xl text-xs text-neutral-100 shadow-md"
  >
    {children}
  </a>
));

export default Tag;
