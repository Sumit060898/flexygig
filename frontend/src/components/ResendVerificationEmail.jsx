// ResendVerificationEmail.jsx

import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ResendVerificationEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResendVerification = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/resend-verification`, { email }, { withCredentials: true });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.message || "An error occurred");
    }
  };

  return (
    <div className="center-container">
      <h2>Enter your email to get a new verification link</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required

        style={{
          color: "#4CAF50",
          cursor: "pointer",
          padding: '5px 80px',
          margin: '22px'
        }}
      />
      <button onClick={handleResendVerification}>Send Verification Email</button>
      {message && <p>{message}</p>}
      <Link to="/">Close</Link>
    </div>
  );
};

export default ResendVerificationEmail;
