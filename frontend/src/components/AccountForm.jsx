import { useState } from "react";
import "../styles/AccountForm.css";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";

const AccountForm = ({ data, setData }) => {
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
        <div className="account-form-container">
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h1 id="heading">Create My Flexygig Worker Account</h1>
            <form>
                <label htmlFor="firstName">First Name</label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={data.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required />
                {errorMessage.firstName && <p className="error-msg">{errorMessage.firstName}</p>}

                <label htmlFor="lastName">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={data.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required />
                {errorMessage.lastName && <p className="error-msg">{errorMessage.lastName}</p>}

                {/* Add a way to store the phone number */}
                <label htmlFor="phone_number">Phone Number</label>
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
}

export default AccountForm;
