import "../styles/SignIn.css";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import FlexygigLogo from "../assets/images/FlexygigLogo.png"
import ExtraSignInMock from "../assets/images/ExtraSignInMock.png"
import ChevronLeft from "../assets/images/ChevronLeft.png"

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignInData({ ...signInData, [name]: value });
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    axios.post(`/api/login`, signInData, { withCredentials: true })
      .then(async (response) => {
        if (
          response.data.success === false ||
          response.data.message === "Account not activated. Please check your email for verification."
        ) {
          setErrorMessage(response.data.message);
        } else {
          try {
            // Fetch the full user object including userImage
            const userRes = await axios.get(`/api/me`, { withCredentials: true });

            localStorage.setItem("user", JSON.stringify(userRes.data));
            setUser(userRes.data);

            navigate("/dashboard");
          } catch (err) {
            console.error("Failed to fetch user after login:", err);
            setErrorMessage("Could not fetch user info after login.");
          }
        }
      })
      .catch((error) => {
        setErrorMessage(
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Invalid credentials. Please try again."
        );
      });
  };

  return (
    <div className="sign-in-container">

      <button id="back-button" onClick={() => navigate("/")}><img src={ChevronLeft} alt="Back to home" /></button>

      <img id="sign-in-logo" src={FlexygigLogo} alt="logo" />
      <p id="header-1">Login to Your Account</p>
      <p id="header-2">Welcome back!</p>
      <img id="mock" src={ExtraSignInMock} alt="mock" /> {/* TODO: Add additional login options (Google, Facebook, Apple) */}
      <Link id="reset-link" to="/initiate-password-reset">Forgot password</Link>
      <form className="form-group" onSubmit={handleSignIn}>
        <div>
          <label htmlFor="signInEmail">Email</label>
          <input
            type="email"
            id="signInEmail"
            name="email"
            value={signInData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="signInPassword">Password</label>
          <input
            type="password"
            id="signInPassword"
            name="password"
            value={signInData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>
        <div>
          <button type="submit">Sign In</button>
        </div>
      </form>
      {errorMessage && <p style={{ color: "#BE0340" }}>{errorMessage}</p>}
      <Link id="register-link" to="/account-selection">Don't have an account?</Link>
    </div>
  );
};

export default SignIn;
