import { useState, useEffect } from "react";
import { motion, useAnimate } from "framer-motion";

import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";

import Alert from "@mui/material/Alert";

// The amount of offset that
const DRAG_SNAP_OFFSET = 100;

const Notification = ({ message, severity, duration }) => {
  // state stores the timers to slide out Notification which can be used to cancel.
  const [prevTimers, setPrevTimers] = useState([]);
  // a ref that points to the container element of Notification used to animate.
  const [mainRef, animateMain] = useAnimate();
  // a ref that points to the arrow indicator inside notification.
  const [arrowRef, animateArrow] = useAnimate();

  // The animation handler for Notification to slide into the screen.
  const slideIn = () => {
    animateMain(
      mainRef.current,
      {
        x: "-100%",
      },
      { duration: 0.3, ease: "easeInOut" }
    );
    animateArrow(
      arrowRef.current,
      {
        rotateY: 180,
      },
      { duration: 0.3, ease: "easeInOut" }
    );
  };
  // The animation handler for Notification to slide out of the screen.
  const slidOut = () => {
    animateMain(
      mainRef.current,
      {
        x: 0,
      },
      { duration: 0.3, ease: "easeInOut" }
    );
    animateArrow(
      arrowRef.current,
      {
        rotateY: 0,
      },
      { duration: 0.3, ease: "easeInOut" }
    );
  };

  const clearAllTimer = () => {
    prevTimers.forEach((timer) => {
      clearTimeout(timer);
    });
  };

  /**
   * EventHandler when user stops dragging the notification
   * @param {*} e: The event, mainly pan event.
   * @param {*} info: All the state info of the current drag event including movements.
   */
  const dragEnd = (e, info) => {
    if (info.offset.x < -DRAG_SNAP_OFFSET) {
      slideIn();
      const timer = setTimeout(() => {
        slidOut();
      }, duration);
      setPrevTimers([...prevTimers, timer]);
    } else {
      slidOut();
    }
  };

  useEffect(() => {
    console.log("CALLED", prevTimers);
  }, [prevTimers]);

  /**
   * On mount animation and on message change animations
   */
  useEffect(() => {
    if (message) {
      slideIn();
      const timer = setTimeout(() => {
        slidOut();
      }, duration);
      setPrevTimers([...prevTimers, timer]);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      {message && (
        <motion.div
          ref={mainRef}
          className="notification fixed top-[80px] left-[calc(100%-20px)] bg-transparent"
          style={{ x: 0 }}
          onMouseOver={() => {
            console.log("ENTER", prevTimers);
            clearAllTimer();
          }}
          onDrag={() => {
            // prevent mouse leave when dragging
            clearAllTimer();
          }}
          onMouseLeave={() => {
            const timer = setTimeout(() => {
              slidOut();
            }, duration);
            console.log("LEAVE", timer);
            setPrevTimers([...prevTimers, timer]);
          }}
          drag="x"
          onDragEnd={dragEnd}
        >
          <Alert
            severity={severity}
            className="bg-slate-400 relative flex items-center bg-opacity-50 backdrop-filter backdrop-blur-sm border border-gray-200 rounded-lg p-3 pl-5 text-white md:w-[30vw] md:max-w-[275px] xs:w-[calc(100vw-20px)] whitespace-normal overflow-hidden"
          >
            <motion.div className="absolute z-[1] left-0" ref={arrowRef}>
              <ArrowLeftIcon />
            </motion.div>
            {message}
          </Alert>
        </motion.div>
      )}
    </>
  );
};

export default Notification;
