// Layout.jsx
import React from "react";
import Toolbar from "./Toolbar";
import DashboardHeader from "./DashboardHeader";
import { Outlet } from "react-router-dom";
import "../styles/Layout.scss";

const Layout = () => {
  return (
    <div className="layout-container">
      <DashboardHeader /> {/* Static Header */}
      <div className="main-content">
        <div className="toolbar">
          <Toolbar /> {/* Static Toolbar */}
        </div>
        <div className="content-area">
          <Outlet /> {/* Dynamic content area */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
