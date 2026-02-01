// PasswordResetInitiation.js

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/PasswordReset.css'

const PasswordResetInitiation = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleInitiatePasswordReset = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/initiate-password-reset`, { email }, { withCredentials: true });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error initiating password reset');
    }
  };

  return (
    <div className="password-reset-container">
      <h2>Enter your email to request for Password Reset</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleInitiatePasswordReset}>Password Reset</button>
      <p style={{ color: "red" }}>{message}</p>
    </div>
  );
};

export default PasswordResetInitiation;
