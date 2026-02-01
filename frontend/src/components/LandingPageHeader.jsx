import "../styles/LandingPageHeader.scss";
import { useNavigate, Link } from "react-router-dom";
import FlexygigIcon from "../assets/images/gigs.png";
import { useUser } from "./UserContext";

const LandingPageHeader = () => {
    const { user } = useUser();

    return (
        <div className="box">
            <div className="logo-container">
                <div className="logo">
                    <img src={FlexygigIcon} />
                </div>
                <div className="flexygig">
                    <h1>Flexygig</h1>
                </div>
            </div>
            <div className="links">
                {user ? (
                    // If user is signed in, show the Dashboard link
                    <Link
                        to="/dashboard"
                        style={{ fontSize: "20px", color: "cyan" }}
                    >
                        Dashboard
                    </Link>
                ) : (
                    // If no user is signed in, show Sign In | Register
                    <>
                        <Link to="/signin" style={{ fontSize: "20px", color: "cyan" }}>
                            Sign In
                        </Link>
                        <p> | </p>
                        <Link to="/register" style={{ fontSize: "20px", color: "cyan" }}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default LandingPageHeader;
