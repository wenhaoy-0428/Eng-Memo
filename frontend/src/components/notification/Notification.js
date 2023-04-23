import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Alert from "@mui/material/Alert";

// const GlassAlert = ({ children, severity = "info" }) => {
//   return (

//   );
// };

const Notification = ({ message, severity, duration, onClose }) => {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // close the notification only when user is not hovering over it
      if (!isHovering) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [message, isHovering]);

  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-5 right-4 bg-gray-50 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-200 rounded-lg p-3"
            onMouseEnter={() => {
              setIsHovering(true);
            }}
            onMouseLeave={() => {
              setIsHovering(false);
            }}
          >
            <Alert severity={severity} className="bg-transparent p-0">
              <div className=" w-[30vw] max-w-[275px]">{message}</div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Notification;
