import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const BusinessContext = createContext();
export const useBusiness = () => useContext(BusinessContext);

export const BusinessProvider = ({ children }) => {
  const { user } = useUser();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    if (!user || !user.isbusiness) {
      setBusiness(null);
      return;
    }
    const fetchBusiness = async () => {
      if (user?.isbusiness) {
        try {
          const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/business/${user.id}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setBusiness(data);
          }
        } catch (err) {
          console.error("Failed to fetch business info:", err);
        }
      }
    };

    fetchBusiness();
  }, [user]);

  return <BusinessContext.Provider value={{ business, setBusiness }}>{children}</BusinessContext.Provider>;
};