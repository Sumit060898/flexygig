import "../styles/ApplicationsWidget.css";
import Arrow from "../assets/images/arrow-more.svg";
import Money from "../assets/images/gigwidget-money.svg";
import Calendar from "../assets/images/gigwidget-calendar.svg";
import Star from "../assets/images/gigwidget-star.svg";
import Grid from "../assets/images/gigwidget-grid.svg";

const ApplicationsWidget = () => {
  var dateStart = new Date();
  dateStart.setDate(dateStart.getDate() + 1);
  var dateEnd = new Date(dateStart);
  dateEnd.setHours(dateEnd.getHours() + 2);
  dateStart = dateStart.toISOString().replace("T", " ").slice(0, -5);
  dateEnd = dateEnd.toISOString().replace("T", " ").slice(0, -5);

  // Retrieve applications
  const getApplication = () => {
    // Dummy app
    var applicant = "Ken Garcia";
    var jobTitle = "Cook";
    var hourlyRate = "$18-25/hr";
    var rating = "4/5";
    var jobStart = dateStart;
    var jobEnd = dateEnd;
    return [applicant, jobTitle, jobStart, jobEnd, hourlyRate, rating];
  };
  const app = getApplication();

  // Format date
  const formatDate = (date) => {
    var tokens = date.split("-");
    var formattedDate = new Date(tokens[0], parseInt(tokens[1]) - 1, tokens[2]);
    var month = formattedDate.toLocaleDateString("en-US", { month: "short" });
    var dayNumber = formattedDate.getDate();
    return `${month} ${dayNumber}`;
  };

  // Format time
  const formatTime = (timeStart, timeEnd) => {
    var tokensStart = timeStart.split(":");
    var tokensEnd = timeEnd.split(":");
    var hourStart = parseInt(tokensStart[0]);
    var hourEnd = parseInt(tokensEnd[0]);
    var ampmStart = hourStart < 12 ? "am" : "pm";
    var ampmEnd = hourEnd < 12 ? "am" : "pm";
    hourStart = hourStart % 12 || 12;
    hourEnd = hourEnd % 12 || 12;
    return `${hourStart}:${tokensStart[1]}${ampmStart} - ${hourEnd}:${tokensEnd[1]}${ampmEnd}`;
  };

  return (
    <div className="applications">
      <h1>New Applications</h1>
      <div className="applications-container">
        <div id="applications-jobtitle">
          {app[0]} is interested in becoming a {app[1]}
          <img id="newgig-arrow" src={Arrow} alt="Arrow icon" />
        </div>
        <p id="applications-hourlyrate">
          <img id="newgig-icons" src={Money} alt="Money icon" /> {app[4]}
        </p>
        <p id="applications-rating">
          <img id="newgig-icons" src={Star} alt="Star icon" /> {app[5]}
        </p>
        <p id="applications-date">
          <img id="newgig-icons" src={Calendar} alt="Calendar icon" />
          {formatDate(app[2].split(" ")[0]).toUpperCase()},{" "}
          {formatTime(app[2].split(" ")[1], app[3].split(" ")[1])}
        </p>
        <p id="applications-percentage">
          <img id="newgig-icons" src={Grid} alt="Grid icon" /> 96.7%
        </p>
        <div className="applications-morebtn">
          <button>More</button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsWidget;
