import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    // Redirect directly to 404.html
    window.location.href = "/404.html";
  }, [location.pathname]);

  return null;
};

export default NotFound;
