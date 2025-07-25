import { useEffect, useRef } from "react";

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 minute of no activity
const LOGOUT_TIMEOUT = 1 * 60 * 1000; // additional 1 minute before logout xz

export const useIdleTimer = (onIdle, onLogoutWarning) => {
  const t1 = useRef();
  const t2 = useRef();

  useEffect(() => {
    const reset = () => {
      clearTimeout(t1.current);
      clearTimeout(t2.current);
      t1.current = setTimeout(() => {
        onLogoutWarning();
        t2.current = setTimeout(onIdle, LOGOUT_TIMEOUT);
      }, IDLE_TIMEOUT);
    };

    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "scroll",
      "touchstart",
    ];
    events.forEach((ev) => window.addEventListener(ev, reset));
    reset();

    return () => {
      clearTimeout(t1.current);
      clearTimeout(t2.current);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [onIdle, onLogoutWarning]); // include dependencies
};
