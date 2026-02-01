import { useState } from "react";
import "../styles/EmployerAccountForm.css";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";

const EmployerAccountForm = ({ data, setData }) => {
    const [errorMessage, setErrorMessage] = useState({});

    const validateField = (value) => {
        let error = "";
        if (!value.trim()) {
            error = "This field is required";
        }
        return error;
    };

    // checks if given phone number matches valid pattern
    const validatePhone = (value) => {
        return /^\d{3}-\d{3}-\d{4}$/.test(value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
        if (name === "phone_number" && value) {
            if (!validatePhone(value)) {
                setErrorMessage({ ...errorMessage, [name]: "Phone Number Format: ###-###-####" })
                return;
            }
        }
        setErrorMessage({ ...errorMessage, [name]: validateField(value) });
    };

    return (
        <div className="employer-account-form-container">
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h1 id="heading">Create My Flexygig Business Account</h1>
            <form>
                <label htmlFor="businessName">Business Name</label>
                <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={data.businessName}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    required />
                {errorMessage.businessName && <p className="error-msg">{errorMessage.businessName}</p>}

                <label htmlFor="businessDescription">Business Description</label>
                <textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={data.businessDescription}
                    onChange={handleChange}
                    placeholder="Enter your business description"
                    required />
                {errorMessage.businessDescription && <p className="error-msg">{errorMessage.businessDescription}</p>}

                {/* Add a way to store the phone number */}
                <label htmlFor="phone_number">Business Phone Number</label>
                <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={data.phone_number || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required />
                {errorMessage.phone_number && <p className="error-msg">{errorMessage.phone_number}</p>}
            </form>
        </div>
    );
};

export default EmployerAccountForm;