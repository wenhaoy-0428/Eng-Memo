import { useEffect, useRef } from "react";

function usePrev(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function highlightBackticks(text) {
  const regex = /`([^`]+)`/g;
  const highlightedText = text.split(regex).map((word, index) => {
    console.log(word, index);
    if (index % 2 === 1) {
      // Wrap the backtick-enclosed word in a <span> with a CSS class for styling
      return (
        <span key={index} className=" bg-slate-100 p-1 text-orange-500 rounded">
          {word}
        </span>
      );
    } else {
      return word;
    }
  });

  return highlightedText;
}
