import { useAnimate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * CircularProgressBar
 * @param progress: The progress value, expressed as a percentage.
 * @param size: The size of the circular progress component, expressed in pixels.
 * @param strokeWidth: The width of the stroke used to draw the progress circle, expressed in pixels.
 * @param strokeColor: The color of the stroke.
 * @param circleColor: The background color of an empty circle.
 */
const CircularProgressBar = ({
  progress = 10,
  size = 30,
  strokeWidth = 2,
  strokeColor = "#4299e1",
  circleColor = "#d1d5db",
}) => {
  // hooks from Framer Motion to animate value
  const progressMotion = useMotionValue(0);
  const [_, animate] = useAnimate();
  // state value that stores the current value of progressMotion
  const [progressState, setProgressState] = useState(0);

  // Increase progressMotion from 0 (initial value) to progress in 1 second
  useEffect(() => {
    animate(progressMotion, progress, {
      duration: 1,
      // continuously update progressState with the latest value of progressMotion
      onUpdate: (latest) => setProgressState(latest),
    });
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progressState / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* An empty circle that is the base of the progress bar */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={circleColor}
      />
      {/* The progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={strokeColor}
        // A solid dash and gap with the same value circumference.
        // However, the solid dash is rendered first and take over the whole space and leaves no room for the gap.
        // Hence, this is solid circle with color equals to `strokeColor`
        strokeDasharray={circumference}
        // offset that pushed the starting point of the circle.
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        // correct the starting point from 3'o clock to 12
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

export default CircularProgressBar;
