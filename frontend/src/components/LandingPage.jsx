import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LandingPage.css";
import WelcomeFlexygig from "../assets/images/welcome-flexygig.png";
import FlexygigLogo from "../assets/images/gigs.png";

const LandingPage = () => {
  const navigate = useNavigate();
  return [
    <div className="home">
      {/*<Featured></Featured>}*/}
      <img src={WelcomeFlexygig} id="welcome-flexygig-image"/>
      <div id="homebuttons-container">
        <Link id="findgig-button" className="custom-link" to="/register?accountType=Worker">
          Find a Gig
        </Link>
        <Link id="postgig-button" className="custom-link" to="/register?accountType=Employer">
          Post a Gig
        </Link>
        <Link id="signin-button" className="custom-link" to="/signin">
          Log in
        </Link>
      </div>
      <img src={FlexygigLogo} id="flexygig-logo-image"/>
    </div>,
  ];
};
export default LandingPage;
