import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

/**
 * Wraps any page with a smooth fade+slide-up entrance animation.
 * Uses the route pathname as a key so a fresh animation fires on every navigation.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "";
  }, [location.pathname]);

  return (
    <div ref={ref} key={location.pathname} className="page-transition-wrapper">
      {children}
    </div>
  );
};

export default PageTransition;
