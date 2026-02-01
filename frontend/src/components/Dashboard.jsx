import React from "react";
import Messages from "./MessageWidget";
import CalendarWidget from "./CalendarWidget";
import NewGigWidget from "./NewGigWidget";
import ApplicationsWidget from "./ApplicationsWidget";
import { Link } from "react-router-dom";
import { useUser } from "./UserContext";
import Arrow from "../assets/images/arrow-more.svg";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        {/* Top Side - Messages, Summary, and Calendar */}
        <section className="dashboard-top">
          {/* Messages */}
          <div className="dashboard-messages">
            <Link
              id="dashboard-messages-link"
              className="custom-link"
              to="/messages">
              <Messages />
            </Link>
          </div>
          {/* Summary */}
          <div className="dashboard-summary">
            <div id="summary-header">
              Monthly Summary
            </div>
            <p id="summary-subheader">October Summary</p>
            <div id="summary-bubble-container">
              <div id="summary-bubble2">
                <p id="summary-bubble2-rating">4/5</p>
                <p id="summary-bubble2-text">Rating</p>
              </div>
              <div id="summary-bubble3">
                <p id="summary-bubble3-gigcount">2 gigs</p>
                <p id="summary-bubble3-text">Gigs Posted</p>
              </div>
              <div id="summary-bubble1">
                <p id="summary-bubble1-text">xyzxyz</p>
              </div>
            </div>
          </div>
          {/* Calendar */}
          <div className="dashboard-calendar">
            <Link to="/my-calendar">
              <CalendarWidget />
            </Link>
          </div>
        </section>

        {/* Bottom Side - New gigs */}
        <aside className="dashboard-bottom">
          {user?.isbusiness ? (
            // Business-specific content
            <div className="dashboard-applications">
              <ApplicationsWidget />
            </div>
          ) : (
            // Worker-specific content
            <div className="dashboard-newgig">
              <Link
                id="dashboard-newgig-link"
                className="custom-link"
                to="/find-gigs">
                <NewGigWidget />
              </Link>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;
