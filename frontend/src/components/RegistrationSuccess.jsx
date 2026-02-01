// RegistrationSuccess.js
import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationSuccess = () => {
  return (
    <div className="center-container">
      <h2>Registration Successful</h2>
      <p>A verification email has been sent to your inbox. Please check your email to complete the registration process.</p>
      <Link
        to="/signin"
        style={{
          marginTop: "10px",
          color: "#4CAF50",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Back to Sign In
      </Link>
    </div>
  );
};
 
export default RegistrationSuccess;
