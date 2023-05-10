import { useContext, createContext, useState } from "react";
import Notification from "../components/notification/Notification";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  // severity level of the alert
  const [severity, setSeverity] = useState("info");
  // duration the notification will last
  const [duration, setDuration] = useState(3000);

  const newNotification = (message, severity = "info", duration = 3000) => {
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
