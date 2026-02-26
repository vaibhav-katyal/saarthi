import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors duration-300">
      <style>{`
        :root {
          --primary: #2196f3;
          --primary-light: #bbdefb;
          --primary-dark: #1976d2;
          --secondary: #f44336;
          --secondary-light: #ffcdd2;
          --accent: #9c27b0;
          --accent-light: #e1bee7;
          --text-primary: #212121;
          --text-secondary: #757575;
          --background: #fafafa;
          --card-bg: #ffffff;
          --border: #e0e0e0;
        }

        [data-theme="dark"] {
          --primary: #64b5f6;
          --primary-light: #1976d2;
          --primary-dark: #bbdefb;
          --secondary: #ef5350;
          --secondary-light: #b71c1c;
          --accent: #ba68c8;
          --accent-light: #7b1fa2;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --background: #121212;
          --card-bg: #1e1e1e;
          --border: #333333;
        }
          
        .not-found-wrapper {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
        }
        .not-found-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
          width: 100%;
        }
        .not-found-info {
          text-align: center;
          padding: 10px;
        }
        .not-found-info img {
          max-width: 80%;
          height: auto;
          margin-bottom: 15px;
        }
        .not-found-info p {
          margin: 15px 0;
          font-size: 16px;
          line-height: 1.4;
          color: var(--text-secondary);
        }
        .not-found-btn {
          margin: 8px;
          padding: 10px 25px;
          font-size: 14px;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
        }
        .not-found-btn:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
        }
        .switcher {
          position: fixed;
          top: 15px;
          right: 15px;
          transform: scale(0.7);
          transform-origin: top right;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .switcher .text {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 5px;
          text-align: center;
        }
        .sw_btn {
          width: 40px;
          height: 40px;
          background-color: var(--card-bg);
          border: 2px solid var(--border);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sw_btn:hover {
          border-color: var(--primary);
        }
        .sw_btn_active {
          background-color: var(--primary);
          border-color: var(--primary);
        }
        @media (max-width: 768px) {
          .not-found-info img {
            max-width: 90%;
          }
          .not-found-info p {
            font-size: 14px;
          }
          .not-found-btn {
            padding: 8px 20px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="not-found-wrapper">
        <div className="not-found-container">
          <div className="switcher" onClick={toggleTheme} style={{ cursor: "pointer" }}>
            <div className={`sw_btn ${theme === "dark" ? "sw_btn_active" : ""}`}></div>
            <div className="text">
              Turn <span className="font-bold">{theme === 'dark' ? 'on' : 'off'}</span><br />the light
            </div>
          </div>

          <div className="not-found-info">
            {theme === "dark" ? (
              <>
                <img
                  src="//pkfrom.github.io/404/assets/img/404-dark.png"
                  alt="404 error"
                />
                <div style={{ marginTop: '20px' }}>
                  <Link to="/" className="not-found-btn">Go Home</Link>
                </div>
              </>
            ) : (
              <>
                <img
                  src="//pkfrom.github.io/404/assets/img/404-light.gif"
                  alt="404 error"
                />
                <p>
                  The page you are looking for was moved, removed,<br />
                  renamed or might never existed.
                </p>
                <div>
                  <Link to="/" className="not-found-btn">Go Home</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
