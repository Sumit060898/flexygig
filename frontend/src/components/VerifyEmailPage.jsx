import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "./UserContext";

const VerifyEmailPage = (setUserData) => {
  const { setUser } = useUser();
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState({
    success: false,
    message: "",
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/verify/${token}`, { withCredentials: true })
      .then((response) => {
        // Set verification status based on the response
        setVerificationStatus({
          success: response.data.success,
          message: response.data.message || "Email verified successfully.",
        });

        if (response.status == 200) {
          let currentUser = response.data;
          currentUser.emailVerified = true;
          localStorage.setItem("user", JSON.stringify(currentUser));
          setUser(currentUser); // Update global user state
        }

        setTimeout(() => {
          navigate("/dashboard"); // Navigate to dashboard
          setTimeout(() => {
            window.location.reload();
          }, 200);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error with verification", error);
        const errorMessage = error.response
          ? error.response.data.message
          : "Verification failed. Please try again.";
        setVerificationStatus({ success: false, message: errorMessage });
      });
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Email Verification</h1>
      <p style={{ color: verificationStatus.success ? "green" : "green" }}>
        {verificationStatus.message}
      </p>
    </div>
  );
};

export default VerifyEmailPage;
