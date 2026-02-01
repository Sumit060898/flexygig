import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext"; 

const ProtectedRoute = ({ children }) => {
  const { user } = useUser(); 

  // Check if user is not logged in and not in localStorage
  if (!user && !localStorage.getItem("user")) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;