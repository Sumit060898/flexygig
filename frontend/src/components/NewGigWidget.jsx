import "../styles/NewGigWidget.css";
import Arrow from "../assets/images/arrow-more.svg";
import Money from "../assets/images/gigwidget-money.svg";
import Calendar from "../assets/images/gigwidget-calendar.svg";
import Star from "../assets/images/gigwidget-star.svg";
import Grid from "../assets/images/gigwidget-grid.svg";

function NewGigWidget() {
  return (
    <div className="newgig">
      <h1>New Gigs</h1>
      <div className="newgig-details">
        <div id="newgig-jobtitle">
          Bartender
          <img id="newgig-arrow" src={Arrow} alt="More details" />
        </div>
        <p id="newgig-hourlyrate">
          <img id="newgig-icons" src={Money} alt="Hourly rate" /> $18-25/hr
        </p>
        <p id="newgig-businessrating">
          <img id="newgig-icons" src={Star} alt="Business rating" /> 4/5
        </p>
        <p id="newgig-date">
          <img id="newgig-icons" src={Calendar} alt="Date and time" /> OCT 19, 5pm-10pm
        </p>
        <p id="newgig-businessname">
          <img id="newgig-icons" src={Grid} alt="Business name" /> TestCorp
        </p>
        <div className="newgig-morebtn">
          <button>More</button>
        </div>
      </div>

      <div className="newgig-details">
        <div id="newgig-jobtitle">
          Server
          <img id="newgig-arrow" src={Arrow} alt="More details" />
        </div>
        <p id="newgig-hourlyrate">
          <img id="newgig-icons" src={Money} alt="Hourly rate" /> $20-30/hr
        </p>
        <p id="newgig-businessrating">
          <img id="newgig-icons" src={Star} alt="Business rating" /> 4.5/5
        </p>
        <p id="newgig-date">
          <img id="newgig-icons" src={Calendar} alt="Date and time" /> OCT 20, 6pm-11pm
        </p>
        <p id="newgig-businessname">
          <img id="newgig-icons" src={Grid} alt="Business name" /> Foodies Inc.
        </p>
        <div className="newgig-morebtn">
          <button>More</button>
        </div>
      </div>
    </div>
  );
}

export default NewGigWidget;
