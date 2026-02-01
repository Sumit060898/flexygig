import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const WorkerContext = createContext();
export const useWorker = () => useContext(WorkerContext);

export const WorkerProvider = ({ children }) => {
    const { user } = useUser();
    const [worker, setWorker] = useState(null);

    useEffect(() => {
        if (!user || user.isbusiness) {
            setWorker(null); // clear out if switching accounts
            return;
        }
        const fetchWorker = async () => {
            if (user && !user.isbusiness) {
                try {
                    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/worker/${user.id}`, { credentials: "include" });
                    if (res.ok) {
                        const data = await res.json();
                        setWorker(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch worker:", err);
                }
            }
        };

        fetchWorker();
    }, [user]);

    return <WorkerContext.Provider value={{ worker, setWorker }}>{children}</WorkerContext.Provider>;
};