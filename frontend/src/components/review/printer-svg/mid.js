function MidPrinter(props) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-50 -7 900 150"
      {...props}
    >
      <rect
        rx="40"
        ry="40"
        width="800"
        height="200"
        fill="rgb(146,163,166)"
        stroke="black"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <circle
        cx="650"
        cy="40"
        r="14"
        fill="white"
        stroke="black"
        strokeWidth="8"
      />
      <circle
        cx="700"
        cy="40"
        r="14"
        fill="white"
        stroke="black"
        strokeWidth="8"
      />
      <circle
        cx="750"
        cy="40"
        r="14"
        fill="white"
        stroke="black"
        strokeWidth="8"
      />
      <line
        x1="100"
        x2="700"
        y1="135"
        y2="135"
        fill="black"
        stroke="black"
        strokeWidth="14"
      />
    </svg>
  );
}

export default MidPrinter;
