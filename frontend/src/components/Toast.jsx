import { useEffect, useState } from "react";

/**
 * Toast Notification Component
 * Props:
 *   message  - string to display
 *   type     - "success" | "error" | "warning"
 *   duration - ms before auto-dismiss (default 3500)
 *   onClose  - called when toast is dismissed
 */
const Toast = ({ message, type = "success", duration = 3500, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss after `duration`
    const exitTimer = setTimeout(() => dismiss(), duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration]);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onClose?.(), 350); // match CSS exit duration
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
  };

  return (
    <div
      className={`toast toast-${type}${visible ? " toast-visible" : ""}${
        exiting ? " toast-exit" : ""
      }`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
