import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/PasswordReset.css";

const PasswordReset = () => {
  const { uniqueIdentifier } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/validate-token/${uniqueIdentifier}`, { withCredentials: true }).then((response) => {
      if (response.data === "valid") {
        setValid(true);
      } else {
        setValid(false);
      }
    });
  }, []);

  const handleResetPassword = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/reset-password`, {
        newPassword,
        confirmPassword,
        uniqueIdentifier,
      }, { withCredentials: true });

      setMessage(response?.data?.message || "Password reset successful");
    } catch (error) {
      console.error(error);
      setMessage("Error resetting password");
    }
  };

  if (!valid) {
    return <p>Unable to access password reset page</p>;
  }

  return (
    <div className="password-reset-container">
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleResetPassword}>Reset Password</button>
      <p>{message}</p>
    </div>
  );
};

export default PasswordReset;
