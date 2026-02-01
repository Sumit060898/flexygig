import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useWorker } from "./WorkerContext";
import { useBusiness } from "./BusinessContext";

// Create the context
const UserContext = createContext();

// Custom hook
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // No localStorage!
  const [loading, setLoading] = useState(true); // To show loading state if needed
  const [error, setError] = useState(null);

  const { setWorker } = useWorker() || {};
  const { setBusiness } = useBusiness() || {};

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setWorker?.(null);
      setBusiness?.(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/me`, {
          credentials: "include", // if using cookies/session
        });

        if (!res.ok) {
          throw new Error("Not logged in or session expired");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
