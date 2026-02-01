import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useUser } from "./UserContext";
import { setUser } from "./UserContext";
import "../styles/Register.css";

import SignUp from "./SignUp";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const accountType = queryParams.get("accountType") || "Worker";

  const { setUser } = useUser();

  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    firstName: accountType === "Worker" ? "" : undefined,
    lastName: accountType === "Worker" ? "" : undefined,
    accountType: accountType,
    businessName: accountType === "Employer" ? "" : undefined,
    photo: "",
    phone_number: "",
    skills: accountType === "Worker" ? [] : undefined,
    experiences: accountType === "Worker" ? [] : undefined,
    traits: accountType === "Worker" ? [] : undefined
  });

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/me`, { credentials: "include" });
      const data = await res.json();
      setUser(data); // this includes the correct profile pic
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };


  const handleRegistration = async (e) => {
    e.preventDefault();

    // ensure Account Type is selected
    // TEMPORARY: also fill lastname with whitespace if accountType is Employer
    if (registrationData.accountType === "" || !registrationData.accountType) {
      setErrorMessage(
        "Please make sure you have selected an account type."
      );
      return;
    }

    if (
      (registrationData.accountType === "Employer" && !registrationData.businessName) ||
      (registrationData.accountType === "Worker" && (!registrationData.firstName || !registrationData.lastName))
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    let uploadedPhotoPath = registrationData.photo;
    const isUploadable = uploadedPhotoPath && (uploadedPhotoPath instanceof File || uploadedPhotoPath instanceof Blob);
    if (isUploadable) {
      const formData = new FormData();
      formData.append("photo", uploadedPhotoPath);

      try {
        const uploadRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const uploadResult = await uploadRes.json();

        if (uploadRes.ok) {
          uploadedPhotoPath = uploadResult.imageUrl;
        } else {
          console.error("Upload failed:", uploadResult.error);
          setErrorMessage("Photo upload failed.");
          return;
        }
      } catch (err) {
        console.error("Upload error:", err);
        setErrorMessage("Photo upload failed.");
        return;
      }
    }

    const formattedData = {
      ...registrationData,
      photo: uploadedPhotoPath, // this is a string at this point
    };

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/pending-register`, formattedData, { withCredentials: true });
      navigate("/registration-success");
      //navigate("/verify/" + response.data.token);

      // Clear input fields
      setRegistrationData({
        firstName: accountType === "Worker" ? "" : undefined,
        lastName: accountType === "Worker" ? "" : undefined,
        businessName: accountType === "Employer" ? "" : undefined,
        email: "",
        password: "",
        photo: "",
        phone_number: "",
        skills: accountType === "Worker" ? [] : undefined,
        experiences: accountType === "Worker" ? [] : undefined,
        traits: accountType === "Worker" ? [] : undefined
      });
      //navigate("/verify/" + response.data.token);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(error.response.data);
      }
    }
  };

  return (
    <div className="register-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <SignUp
        data={registrationData}
        setData={setRegistrationData}
        onFinish={handleRegistration}
      />
    </div>
  );
};
export default Register;
