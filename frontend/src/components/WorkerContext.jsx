// frontend/src/components/WorkerContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";

const WorkerContext = createContext();
export const useWorker = () => useContext(WorkerContext);

export const WorkerProvider = ({ children }) => {
  const { user } = useUser();

  // All worker profiles for this user (rows from workers table)
  const [profiles, setProfiles] = useState([]);
  const [activeWorkerProfileId, setActiveWorkerProfileId] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Helper: localStorage key per-user so different accounts don't collide
  const storageKey = useMemo(() => {
    if (!user?.id) return null;
    return `activeWorkerProfileId_${user.id}`;
  }, [user?.id]);

  // Active profile object (convenience)
  const activeProfile = useMemo(() => {
    if (!activeWorkerProfileId) return null;
    return profiles.find((p) => Number(p.id) === Number(activeWorkerProfileId)) || null;
  }, [profiles, activeWorkerProfileId]);

  // Keep a worker-like object for backward compatibility with old components
  // Old code expects `worker.first_name/last_name`
  const worker = activeProfile
    ? {
        ...activeProfile,
        first_name: activeProfile.first_name,
        last_name: activeProfile.last_name,
        profile_name: activeProfile.profile_name,
      }
    : null;

  // Load worker profiles whenever user changes
  useEffect(() => {
    // If not logged in or is business account, reset everything and remove saved key
    if (!user || user.isbusiness) {
      setProfiles([]);
      setActiveWorkerProfileId(null);
      if (storageKey) {
        try {
          localStorage.removeItem(storageKey);
        } catch (e) {
          /* ignore localStorage errors in unusual environments */
        }
      }
      return;
    }

    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles/${user.id}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("Failed to fetch worker profiles:", res.status);
          setProfiles([]);
          setActiveWorkerProfileId(null);
          if (storageKey) {
            try { localStorage.removeItem(storageKey); } catch (e) {}
          }
          return;
        }

        const data = await res.json();
        setProfiles(Array.isArray(data) ? data : []);

        // Decide active profile:
        // 1) localStorage (if valid)
        // 2) primary
        // 3) first
        const saved = storageKey ? localStorage.getItem(storageKey) : null;

        const savedValid =
          saved && (Array.isArray(data) ? data.some((p) => String(p.id) === String(saved)) : false);

        if (savedValid) {
          setActiveWorkerProfileId(Number(saved));
        } else {
          const primary = (Array.isArray(data) ? data : []).find((p) => p.is_primary === true);
          const fallback = primary || (Array.isArray(data) ? data[0] : null);
          setActiveWorkerProfileId(fallback ? Number(fallback.id) : null);
          if (storageKey && fallback) {
            try { localStorage.setItem(storageKey, String(fallback.id)); } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Failed to fetch worker profiles:", err);
        setProfiles([]);
        setActiveWorkerProfileId(null);
        if (storageKey) {
          try { localStorage.removeItem(storageKey); } catch (e) {}
        }
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [user, storageKey]);

  // Setter that also persists; accepts null to clear selection
  const setActiveProfile = (newId) => {
    const idNum = newId == null ? null : Number(newId);
    setActiveWorkerProfileId(idNum);
    if (storageKey) {
      try {
        if (idNum == null) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, String(idNum));
        }
      } catch (e) {
        /* ignore localStorage errors */
      }
    }
  };

  return (
    <WorkerContext.Provider
      value={{
        // Backwards-compatible
        worker,
        setWorker: () => {
          // Intentionally no-op: worker now derives from activeProfile.
          // (If you need to refresh, call refreshProfiles below.)
          console.warn("setWorker is deprecated. Use worker profiles APIs + refreshProfiles instead.");
        },

        // New multi-profile state
        profiles,
        loadingProfiles,
        activeWorkerProfileId,
        setActiveWorkerProfileId: setActiveProfile,
        activeProfile,

        // Optional: allow pages to refetch after creating a profile
        refreshProfiles: async () => {
          if (!user || user.isbusiness) return;

          setLoadingProfiles(true);
          try {
            const res = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles/${user.id}`,
              { credentials: "include" }
            );
            if (!res.ok) return;

            const data = await res.json();
            setProfiles(Array.isArray(data) ? data : []);

            // Ensure current active id still exists
            if (activeWorkerProfileId) {
              const exists = (Array.isArray(data) ? data : []).some(
                (p) => Number(p.id) === Number(activeWorkerProfileId)
              );
              if (!exists) {
                const primary = (Array.isArray(data) ? data : []).find((p) => p.is_primary === true);
                const fallback = primary || (Array.isArray(data) ? data[0] : null);
                setActiveProfile(fallback ? fallback.id : null);
              }
            }
          } catch (e) {
            console.error("Failed to refresh worker profiles:", e);
          } finally {
            setLoadingProfiles(false);
          }
        },
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};