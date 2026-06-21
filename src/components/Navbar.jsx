import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav>
      <Link to="/">
        <div>
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="DevRift Logo"
          />
          <h3>DevRift</h3>
        </div>
      </Link>
      <div>
        {/* Show "New Repo" only on the dashboard — clicking scrolls to the button */}
        {location.pathname === "/" && (
          <button
            id="navbar-new-repo"
            onClick={() => {
              const btn = document.getElementById("new-repo-btn");
              if (btn) btn.click();
            }}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-h)",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-h)";
            }}
          >
            + New Repository
          </button>
        )}
        <Link to="/ai/resume" id="nav-ai-resume" style={{ textDecoration: "none" }}>
          <p style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: 13,
          }}>
            ✨ AI Resume
          </p>
        </Link>
        <Link to="/profile">
          <p>Profile</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;