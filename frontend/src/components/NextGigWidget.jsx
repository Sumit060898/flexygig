import "../styles/NextGigWidget.css";
import AvatarIcon from "../assets/images/AvatarIcon.ico";
import LocationIcon from "../assets/images/LocationIcon.ico";
import InformationIcon from "../assets/images/InformationIcon.ico";
import CarIcon from "../assets/images/CarIcon.ico";

const NextGigWidget = () => {
  // simulate next gig date with format: XXXX-XX-XX XX:XX:XX
  //                                     YEAR-MONTH-DAY TIME
  var gigDate = new Date();
  gigDate.setDate(gigDate.getDate() + 1);
  var gigDateEnd = new Date(gigDate);
  gigDateEnd.setHours(gigDateEnd.getHours() + 2);
  gigDate = gigDate.toISOString().replace("T", " ").slice(0, -5);
  gigDateEnd = gigDateEnd.toISOString().replace("T", " ").slice(0, -5);

  // get user's next gig
  // gig: [jobTitle, jobType, jobStart, jobEnd, location, employer]
  const getNextGig = () => {
    // dummy gig
    var jobTitle = "Gift Deliver";
    var jobType = "Strictly Scheduled Delivery";
    var jobStart = gigDate;
    var jobEnd = gigDateEnd;
    var location = "Downtown Vancouver";
    var employer = ["Dosa Factory", "+17783797791"];
    return [jobTitle, jobType, jobStart, jobEnd, location, employer];
  };
  const nextGig = getNextGig();

  // convert XXXX-XX-XX -> DAY_NAME MONTH DAY_NUMBER (e.g. Sunday Jan 1)
  const formatDate = (date) => {
    var tokens = date.split("-");
    var formattedDate = new Date(tokens[0], parseInt(tokens[1]) - 1, tokens[2]);
    var dayName = formattedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    var month = formattedDate.toLocaleDateString("en-US", { month: "short" });
    var dayNumber = formattedDate.getDate();
    return dayName + " " + month + " " + dayNumber;
  };

  // convert (XX:XX:XX, XX:XX:XX) -> XX:XX A.M./P.M. - XX:XX A.M./P.M.
  const formatTime = (timeStart, timeEnd) => {
    // get tokens
    var tokensStart = timeStart.split(":");
    var tokensEnd = timeEnd.split(":");
    // parse hour tokens to int
    var hourStart = parseInt(tokensStart[0]);
    var hourEnd = parseInt(tokensEnd[0]);
    // set A.M/P.M. based on hour
    var ampmStart = hourStart < 12 ? "A.M." : "P.M.";
    var ampmEnd = hourEnd < 12 ? "A.M." : "P.M.";
    // convert hour to 12HR format
    hourStart = hourStart % 12;
    hourStart = hourStart ? hourStart : 12;
    // change hour value 0 to 12
    hourEnd = hourEnd % 12;
    hourEnd = hourEnd ? hourEnd : 12;
    var startTime = "" + hourStart + ":" + tokensStart[1] + " " + ampmStart;
    var endTime = "" + hourEnd + ":" + tokensEnd[1] + " " + ampmEnd;
    return startTime + " - " + endTime;
  };

  const getDistance = () => {
    // TODO: calculate user's distance to gig's location
    return "18 min away";
  };

  return (
    <div className="nextgig">
      <h1>Next Gig</h1>
      <div className="nextgig-container">
        <div className="nextgig-date-time">
          <p id="nextgig-date">{formatDate(nextGig[2].split(" ")[0])}</p>
          <p id="nextgig-time">
            {formatTime(nextGig[2].split(" ")[1], nextGig[3].split(" ")[1])}
          </p>
        </div>
        <p id="nextgig-title">{nextGig[0]}</p>
        <p id="nextgig-employer">
          <img src={AvatarIcon} alt="Employer Icon" />
          <span>{nextGig[5][0]}</span>
          {nextGig[5][1]}
        </p>
        <p id="nextgig-location">
          <img src={LocationIcon} alt="Location Icon" />
          {nextGig[4]}
        </p>
        <div className="nextgig-type-distance">
          <p id="nextgig-type">
            <img src={InformationIcon} alt="Information Icon" />
            {nextGig[1]}
          </p>
          <p id="nextgig-distance">
            <img src={CarIcon} alt="Travel Icon" />
            {getDistance()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NextGigWidget;
