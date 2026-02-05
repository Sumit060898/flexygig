import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "./UserContext";
import { useWorker } from "./WorkerContext";

import ArrowBack from "../assets/images/ChevronLeft.png";
import Arrow from "../assets/images/arrow-more.svg";
import Money from "../assets/images/gigwidget-money.svg";
import Calendar from "../assets/images/gigwidget-calendar.svg";
import Star from "../assets/images/gigwidget-star.svg";
import Grid from "../assets/images/gigwidget-grid.svg";
import Bookmark from "../assets/images/bookmark-icon.svg";
import SearchFilter from "../assets/images/search-filter-icon.svg";

import "../styles/WorkerBoard.css";

const WorkerBoard = () => {
  const { user } = useUser();

  // ✅ multi-profile support
  const {
    profiles,
    activeProfile,
    activeWorkerProfileId,
    setActiveWorkerProfileId,
    loadingProfiles
  } = useWorker();

  const WorkerItem = () => {
    return (
      <div id="workerboard-worker">
        <div id="workerboard-worker-header">
          {/* ✅ Use active profile name instead of hardcoded */}
          <h2 id="workerboard-worker-name">
            {activeProfile
              ? `${activeProfile.first_name} ${activeProfile.last_name}`
              : "Worker"}
          </h2>
          <img id="workerboard-arrow" src={Arrow} alt="" />
        </div>

        <div id="workerboard-worker-details">
          <div id="workerboard-worker-item">
            <img id="workerboard-icons" src={Money} alt="" />
            Insert 1
          </div>
          <div id="workerboard-worker-item">
            <img id="workerboard-icons" src={Star} alt="" />
            Insert 2
          </div>
          <div id="workerboard-worker-item">
            <img id="workerboard-icons" src={Calendar} alt="" />
            Insert 3
          </div>
          <div id="workerboard-worker-item">
            <img id="workerboard-icons" src={Grid} alt="" />
            Insert 4
          </div>
          <div id="workerboard-worker-actions">
            <img id="workerboard-bookmark" src={Bookmark} alt="" />
            <div id="workerboard-actions-button"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="workerboard-content">
      <div id="workerboard-header">
        <img id="workerboard-arrow-back" src={ArrowBack} alt="" />
        <h1>Find Workers</h1>

        {/* ✅ NEW: profile dropdown (minimal) */}
        {!user?.isbusiness && (
          <div style={{ marginLeft: "auto" }}>
            <select
              value={activeWorkerProfileId || ""}
              onChange={(e) => setActiveWorkerProfileId(e.target.value)}
              disabled={loadingProfiles}
            >
              {loadingProfiles && <option value="">Loading...</option>}

              {!loadingProfiles && profiles.length === 0 && (
                <option value="">No profiles</option>
              )}

              {!loadingProfiles &&
                profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profile_name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      <div id="workerboard-skill-search">
        <img id="workerboard-filter-icon" src={SearchFilter} alt="" />
        <div id="workerboard-skill-item">Skills</div>
        <div id="workerboard-skill-item">Skills</div>
        <div id="workerboard-skill-item">Skills</div>
      </div>

      <div id="workerboard-items">
        <WorkerItem />
        <WorkerItem />
        <WorkerItem />
        <WorkerItem />
        <WorkerItem />
        <WorkerItem />
        <WorkerItem />
        <WorkerItem />
      </div>
    </div>
  );
};

export default WorkerBoard;