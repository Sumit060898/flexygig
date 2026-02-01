import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "./UserContext";

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

  const WorkerItem = () => {
    return (
      <div id='workerboard-worker'>
          <div id='workerboard-worker-header'>
            <h2 id='workerboard-worker-name'>Amy Denver</h2>
            <img id="workerboard-arrow" src={Arrow} alt=""/>
          </div>
          <div id='workerboard-worker-details'>
            <div id='workerboard-worker-item'>
              <img id="workerboard-icons" src={Money} alt=""/>
              Insert 1
            </div>
            <div id='workerboard-worker-item'>
              <img id="workerboard-icons" src={Star} alt=""/>
              Insert 2
            </div>
            <div id='workerboard-worker-item'>
              <img id="workerboard-icons" src={Calendar} alt=""/>
              Insert 3
            </div>
            <div id='workerboard-worker-item'>
              <img id="workerboard-icons" src={Grid} alt=""/>
              Insert 4
            </div>
            <div id='workerboard-worker-actions'>
              <img id="workerboard-bookmark" src={Bookmark} alt=""/>
              <div id='workerboard-actions-button'></div>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div id='workerboard-content'>
      <div id='workerboard-header'>
        <img id="workerboard-arrow-back" src={ArrowBack} alt=""/>
        <h1>Find Workers</h1>
      </div>
      <div id='workerboard-skill-search'>
        <img id="workerboard-filter-icon" src={SearchFilter} alt=""/>
        <div id='workerboard-skill-item'>Skills</div>
        <div id='workerboard-skill-item'>Skills</div>
        <div id='workerboard-skill-item'>Skills</div>
      </div>

      <div id='workerboard-items'>
        <WorkerItem/>
        <WorkerItem/>
        <WorkerItem/>
        <WorkerItem/>
        <WorkerItem/>
        <WorkerItem/>
        <WorkerItem/>
        <WorkerItem/>
      </div>
    </div>
    )

}


export default WorkerBoard;

