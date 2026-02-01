import React from 'react';
import '../styles/LocationForm.css'; // Import your CSS file for styling
import FlexygigLogo from "../assets/images/FlexygigLogo.png";
//import { useState } from "react";

const LocationForm = ({ data, setData }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };

    return (
        <div className="location-form-container">
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h3>Location Info</h3>
            <input
                type="text"
                name="street_address"
                placeholder="Street Address"
                value={data.street_address || ""}
                onChange={handleChange}
            />
            <input
                type="text"
                name="city"
                placeholder="City"
                value={data.city || ""}
                onChange={handleChange}
            />
            <input
                type="text"
                name="province"
                placeholder="Province"
                value={data.province || ""}
                onChange={handleChange}
            />
            <input
                type="text"
                name="postal_code"
                placeholder="Zip Code"
                value={data.postal_code || ""}
                onChange={handleChange}
            />
        </div>
    );
}

export default LocationForm;
