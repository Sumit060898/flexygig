import React from "react";
import { useNavigate } from "react-router-dom";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";
import chevronLeft from "../assets/images/ChevronLeft.png";
import "../styles/AccountSelection.css";

const AccountSelection = () => {
    const navigate = useNavigate();
    
    return (
        <div className="account-selection-container">
            <button id="back-button" onClick={() => navigate("/signin")}>
                <img src={chevronLeft} alt="Back to sign in" /></button>
            <img id="account-selection-logo" src={FlexygigLogo} alt="logo" />
            <h1>Select Account Type</h1>
            <div className="account-selection-buttons">
                <button className="account-button" onClick={() => navigate("/register?accountType=Worker", {state: { fromAccountSelection: true}})}>
                    Create Worker Account
                </button>
                <button className="account-button" onClick={() => navigate("/register?accountType=Employer", {state: { fromAccountSelection: true}})}>
                    Create Employer Account
                </button>
            </div>
        </div>  
    );
};

export default AccountSelection;
