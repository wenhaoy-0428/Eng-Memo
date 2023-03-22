function LowerPrinter(props) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-50 157 900 200"
      {...props}
    >
      <rect
        rx="40"
        ry="40"
        width="800"
        height="250"
        fill="rgb(146,163,166)"
        stroke="black"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <rect
        x="100"
        y="200"
        width="600"
        height="100"
        fill="rgb(123, 249, 209)"
        stroke="black"
        strokeWidth="14"
      />
    </svg>
  );
}

export default LowerPrinter;
