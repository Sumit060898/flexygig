import React, { useState } from 'react';
import "../styles/DashboardHeader.scss";
import flexygig from "../assets/images/gigs.png";
import { Link } from "react-router-dom";
import NotificationIcon from "../assets/images/NotificationIcon.png";
import DefaultAvatar from "../assets/images/DefaultAvatar.png";
import { useUser } from "./UserContext";
import { useWorker } from './WorkerContext';
import { useBusiness } from './BusinessContext';
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {

    const { user } = useUser();

    // ✅ Minimal change: also read activeProfile for multi-profile support.
    // Keep `worker` for backward compatibility with existing WorkerContext usage.
    const { worker, activeProfile } = useWorker();

    const { business } = useBusiness();
    const { logout } = useUser();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const navigate = useNavigate();
    const handleSignOut = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    const [searchTerm, setSearchTerm] = useState("");
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            const trimmed = searchTerm.trim();
            if (trimmed.length > 0) {
                navigate(`/search?query=${encodeURIComponent(trimmed)}`);
            } else {
                navigate(`/search`);
            }
        }
    };

    const backendURL = process.env.REACT_APP_BACKEND_URL;

    const profilePic = user?.userImage && typeof user.userImage === "string"
        ? `${backendURL}${user.userImage.startsWith("/") ? "" : "/"}${user.userImage}`
        : DefaultAvatar;

    // ✅ Minimal change: name should come from active profile if worker user has multiple profiles
    const workerDisplayName =
        activeProfile?.first_name ||
        worker?.first_name ||
        "User";

    return (
        <div className="dashboard-header">
            <div className="header-section left">
                <div className="logo">
                    <img src={flexygig} alt="Flexygig Logo" className="logo-img" />
                    <h1 className="logo-name">
                        <span className="flexy">FLEXY</span>
                        <span className="gig">GIG</span>
                    </h1>
                </div>
            </div>

            <div className="header-section center">
                <input type="text"
                    className="search-bar"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
            </div>

            <div className="header-section right">
                <div className="user-menu">
                    <div className="user-info" onClick={toggleDropdown}>
                        <img src={profilePic} alt="User Avatar" className="user-avatar" />
                        <span className="user-name">
                            {user ? user.isbusiness ? business?.business_name || "Business" : `${workerDisplayName}` : "User"}
                        </span>
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>

                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <Link to="/profile" className="dropdown-item">View Profile</Link>
                        <button onClick={handleSignOut} className="dropdown-item logout-button">Sign Out</button>

                    </div>
                )}
            </div>

            <Link to="/notifications" className="notification-btn">
                <img src={NotificationIcon} alt="Notifications" className="notification-icon" />
            </Link>
        </div>
    );
};

export default DashboardHeader;