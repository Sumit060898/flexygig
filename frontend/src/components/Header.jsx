import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

import "../styles/Header.scss";

const Header = () => {
  const [active, setactive] = useState(false);
  const [active1, setactive1] = useState(false);
  const { user, setUser } = useUser();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setactive(window.scrollY > 0);
      setactive1(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    // Redirect to the landing page or sign-in page
    navigate("/signin");
  };

  return (
    <div
      className={
        active || location.pathname !== "/" ? "navbar active" : "navbar"
      }
    >
      <div className="container">
        <div className="logo">
          <Link to="/" className="link">
            <span className="log">FlexyGig</span>
          </Link>
        </div>

        <div className="links">
          {/* Conditional rendering based on user state */}
          {!user || !user.emailVerified ? (
            <>
              {location.pathname !== "/signin" && (
                <Link to="/signin">Login</Link>
              )}
              {location.pathname !== "/register" && (
                <Link to="/register">Register</Link>
              )}
            </>
          ) : (
            <>
              <span>Welcome, {user.firstname}!</span>
              <Link to="/dashboard">Home</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/my-jobs">My Jobs</Link>
              <Link to="/gig-workers">Gig Worker Community</Link>
              <Link to="/my-calendar">My Calendar</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
