import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Alert from "@mui/material/Alert";

const Notification = ({ message, severity, duration, onClose }) => {
  const [prevTimer, setPrevTimer] = useState(undefined);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      setPrevTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
              clearTimeout(prevTimer);
            }}
            onMouseLeave={() => {
              setTimeout(() => {
                onClose();
              }, 1000);
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
