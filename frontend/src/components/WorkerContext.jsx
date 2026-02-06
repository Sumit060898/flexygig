// frontend/src/components/WorkerContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useUser } from "./UserContext";

const WorkerContext = createContext();
export const useWorker = () => useContext(WorkerContext);

export const WorkerProvider = ({ children }) => {
  const { user } = useUser();

  const [profiles, setProfiles] = useState([]);
  const [activeWorkerProfileId, setActiveWorkerProfileId] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const storageKey = useMemo(() => {
    if (!user?.id) return null;
    return `activeWorkerProfileId_${user.id}`;
  }, [user?.id]);

  const activeProfile = useMemo(() => {
    if (!activeWorkerProfileId) return null;
    return profiles.find((p) => Number(p.id) === Number(activeWorkerProfileId)) || null;
  }, [profiles, activeWorkerProfileId]);

  const worker = activeProfile
    ? {
        ...activeProfile,
        first_name: activeProfile.first_name,
        last_name: activeProfile.last_name,
        profile_name: activeProfile.profile_name,
      }
    : null;

  // Setter that also persists
  const setActiveProfile = useCallback(
    (newId) => {
      const idNum = newId == null ? null : Number(newId);
      setActiveWorkerProfileId(idNum);

      if (storageKey) {
        try {
          if (idNum == null) localStorage.removeItem(storageKey);
          else localStorage.setItem(storageKey, String(idNum));
        } catch (e) {}
      }
    },
    [storageKey]
  );

  // ✅ Centralized fetch
  const refreshProfiles = useCallback(async () => {
    if (!user || user.isbusiness) return;

    setLoadingProfiles(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles/${user.id}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        console.error("Failed to fetch worker profiles:", res.status);
        setProfiles([]);
        setActiveProfile(null);
        if (storageKey) {
          try { localStorage.removeItem(storageKey); } catch (e) {}
        }
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProfiles(list);

      // Keep active selection if still exists; otherwise fall back to primary or first.
      const currentId = activeWorkerProfileId;
      const exists =
        currentId != null && list.some((p) => Number(p.id) === Number(currentId));

      if (exists) return;

      const primary = list.find((p) => p.is_primary === true);
      const fallback = primary || list[0] || null;
      setActiveProfile(fallback ? fallback.id : null);
    } catch (err) {
      console.error("Failed to refresh worker profiles:", err);
    } finally {
      setLoadingProfiles(false);
    }
  }, [user, user?.id, user?.isbusiness, storageKey, activeWorkerProfileId, setActiveProfile]);

  // Initial load when user changes
  useEffect(() => {
    if (!user || user.isbusiness) {
      setProfiles([]);
      setActiveProfile(null);
      if (storageKey) {
        try { localStorage.removeItem(storageKey); } catch (e) {}
      }
      return;
    }

    (async () => {
      setLoadingProfiles(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles/${user.id}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("Failed to fetch worker profiles:", res.status);
          setProfiles([]);
          setActiveProfile(null);
          if (storageKey) {
            try { localStorage.removeItem(storageKey); } catch (e) {}
          }
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setProfiles(list);

        // Decide active profile:
        // 1) saved localStorage (if valid)
        // 2) primary
        // 3) first
        const saved = storageKey ? localStorage.getItem(storageKey) : null;
        const savedValid = saved && list.some((p) => String(p.id) === String(saved));

        if (savedValid) {
          setActiveProfile(saved);
        } else {
          const primary = list.find((p) => p.is_primary === true);
          const fallback = primary || list[0] || null;
          setActiveProfile(fallback ? fallback.id : null);
        }
      } catch (err) {
        console.error("Failed to fetch worker profiles:", err);
        setProfiles([]);
        setActiveProfile(null);
        if (storageKey) {
          try { localStorage.removeItem(storageKey); } catch (e) {}
        }
      } finally {
        setLoadingProfiles(false);
      }
    })();
  }, [user, user?.id, user?.isbusiness, storageKey, setActiveProfile]);

  // ✅ NEW: Set primary without reload + refresh state
  const setPrimaryProfile = useCallback(
    async (workerProfileId) => {
      if (!user || user.isbusiness) return;

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles/${user.id}/primary/${workerProfileId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to set primary (${res.status}) ${txt}`);
      }

      // Keep the same active profile selected (just mark as primary in DB)
      setActiveProfile(workerProfileId);

      // Refresh list so UI shows "(primary)"
      await refreshProfiles();
    },
    [user, refreshProfiles, setActiveProfile]
  );

  return (
    <WorkerContext.Provider
      value={{
        worker,
        setWorker: () => {
          console.warn("setWorker is deprecated. Use worker profiles APIs + refreshProfiles instead.");
        },

        profiles,
        loadingProfiles,
        activeWorkerProfileId,
        setActiveWorkerProfileId: setActiveProfile,
        activeProfile,

        refreshProfiles,
        setPrimaryProfile, // ✅ expose
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};