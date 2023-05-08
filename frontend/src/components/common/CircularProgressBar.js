import {
  motion,
  useAnimate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

/**
 * CircularProgressBar
 * @param progress: The progress value, expressed as a decimal number.
 * @param size: The size of the circular progress component, expressed in pixels.
 * @param strokeWidth: The width of the stroke used to draw the progress circle, expressed in pixels.
 * @param strokeColor: The color of the stroke.
 * @param circleColor: The background color of an empty circle.
 */
const CircularProgressBar = ({
  progress = 1,
  size = 30,
  strokeWidth = 2,
  strokeColor = "#4299e1",
  circleColor = "#d1d5db",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // hooks from Framer Motion to animate value
  const progressMotion = useMotionValue(0);
  const [_, animate] = useAnimate();
  // transform progressMotion into offset
  const progressOffset = useTransform(
    progressMotion,
    (value) => circumference - value * circumference
  );

  // Increase progressMotion from 0 (initial value) to progress in 1 second
  useEffect(() => {
    animate(progressMotion, progress, {
      duration: 1,
      // continuously update progressState with the latest value of progressMotion
      // onUpdate: (latest) => console.log(latest),
    });
  }, []);

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
      <motion.circle
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
        strokeLinecap="round"
        // correct the starting point from 3'o clock to 12
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        // offset that pushed the starting point of the circle.
        style={{ strokeDashoffset: progressOffset }}
      />
    </svg>
  );
};

export default CircularProgressBar;
