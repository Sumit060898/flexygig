import React from "react";
import DefaultAvatar from "../assets/images/DefaultAvatar.png";
import MessageBubbles from "../assets/images/MessageBubbles.png";
import { useNavigate } from "react-router-dom";

const UserProfileWidget = ({ user }) => {
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  const profilePic = user?.userImage
    ? `${backendURL}${user.userImage.startsWith("/") ? "" : "/"}${user.userImage}`
    : DefaultAvatar; // fallback avatar

  const handleMessage = () => {
    navigate(`/messages`, { state: { partnerId: user.id } });
  };

  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
      backgroundColor: "#f9f9f9"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={profilePic}
          alt="Profile"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            marginRight: "16px",
            objectFit: "cover"
          }}
        />
        <div>
          <h3 style={{ margin: "0" }}>
            {user.isbusiness ? user.business_name : `${user.first_name} ${user.last_name}`}
          </h3>
          <p style={{ margin: "0" }}>
            {user.city}, {user.province}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "12px" }}>
        <p><strong>Phone:</strong> {user.phone_number}</p>
        <p><strong>Email:</strong> {user.email}</p>

        {!user.isbusiness ? (
          <>
            {user.skills && (
              <p><strong>Skills:</strong> {user.skills.join(", ")}</p>
            )}
            {user.traits && (
              <p><strong>Traits:</strong> {user.traits.join(", ")}</p>
            )}
            {user.experiences && (
              <p><strong>Experience:</strong> {user.experiences.join(", ")}</p>
            )}
          </>
        ) : (
          <>
            {user.business_description && (
              <p><strong>About:</strong> {user.business_description}</p>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: "16px", textAlign: "right" }}>
        <button
          onClick={handleMessage}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid black",
            color: "black",
            border: "none",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: "pointer"
          }}
        >
          <img
            src={MessageBubbles}
            alt="message-bubbles"
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          Message
        </button>
      </div>
    </div>
  );
};

export default UserProfileWidget;
