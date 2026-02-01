import React from "react";
import { Link, useLocation } from "react-router-dom";
import EnvelopeIcon from "../assets/images/EnvelopeIcon.png";
import CalendarIcon from "../assets/images/CalendarIcon.png";
import MessagesIcon from "../assets/images/ChatIcon.png";
import FolderAddIcon from "../assets/images/FolderAddIcon.png";
import UserIcon from "../assets/images/UserIcon.png";
import HomeIcon from "../assets/images/HomeIcon.png";
import AddIcon from "../assets/images/AddIcon.png";
import { useUser } from "./UserContext";

import "../styles/Toolbar.scss";

const Toolbar = () => {
  const { user, setUser } = useUser();
  const location = useLocation();

  if (!user) {
    return (
      <div className="toolbar">
        <Link to="/signin">
          <p>Please sign in</p>
        </Link>
      </div>
    );
  }

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="toolbar">
      <div className="toolbar-items">
        <p id="toolbar-menu">MENU</p>
        <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
          <img src={HomeIcon} alt="Home" className="toolbar-icon" />
          <p>Home</p>
        </Link>
        <Link to="/notifications" className={isActive("/notifications") ? "active" : ""}>
          <img src={EnvelopeIcon} alt="Notifications" className="toolbar-icon" />
          <p>Notifications</p>
        </Link>
        <Link to="/my-calendar" className={isActive("/my-calendar") ? "active" : ""}>
          <img src={CalendarIcon} alt="Calendar" className="toolbar-icon" />
          <p>Calendar</p>
        </Link>
        <Link to="/messages" className={isActive("/messages") ? "active" : ""}>
          <img src={MessagesIcon} alt="Messages" className="toolbar-icon" />
          <p>Messages</p>
        </Link>
        <p id="toolbar-others">OTHERS</p>
        {user.isbusiness ? (
          <Link to="/worker-board" className={isActive("/worker-board") ? "active" : ""}>
            <img src={AddIcon} alt="Worker Board" className="toolbar-icon" />
            <p>Worker Board</p>
          </Link>
        ) : (
          <Link to="/find-gigs" className={isActive("/find-gigs") ? "active" : ""}>
            <img src={AddIcon} alt="Find Gigs" className="toolbar-icon" />
            <p>Find Gigs</p>
          </Link>
        )}
        {user.isbusiness ? (
          <Link to="/my-jobs" className={isActive("/my-jobs") ? "active" : ""}>
            <img src={FolderAddIcon} alt="My Jobs" className="toolbar-icon" />
            <p>My Jobs</p>
          </Link>
        ) : (
          <Link to="/jobs-applied" className={isActive("/jobs-applied") ? "active" : ""}>
            <img src={FolderAddIcon} alt="Jobs Applied" className="toolbar-icon" />
            <p>Jobs Applied</p>
          </Link>
        )}
        <Link to="/profile" className={isActive("/profile") ? "active" : ""}>
          <img src={UserIcon} alt="Profile" className="toolbar-icon" />
          <p>Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default Toolbar;
