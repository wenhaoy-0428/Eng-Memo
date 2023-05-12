import { useContext, createContext, useState } from "react";
import Notification from "../components/notification/Notification";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  // severity level of the alert
  const [severity, setSeverity] = useState("");
  // duration the notification will last
  const [duration, setDuration] = useState(0);

  /**
   * Broadcast new notification
   * @param {*} message The content of the Notification
   * @param {*} severity The type of the notification which determine the color and icon of the notification "error" | "warning" | "success" | "info"
   * @param {*} duration The time the notification will remain on screen
   */
  const newNotification = (message, severity = "info", duration = 5000) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(duration);
  };

  return (
    <NotificationContext.Provider value={{ newNotification }}>
      {children}
      <Notification message={message} severity={severity} duration={duration} />
    </NotificationContext.Provider>
  );
};

/**
 * context reader hook
 * @returns context value which includes function to initialize new notification.
 */
export const useNotification = () => {
  return useContext(NotificationContext);
};
