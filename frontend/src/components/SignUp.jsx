import "../styles/SignUp.css";
import EmailForm from "./EmailForm";
import AccountForm from "./AccountForm";
import PhotoForm from "./PhotoForm";
import SkillsForm from "./SkillsForm";
import ExperienceForm from "./ExperienceForm";
import TraitsForm from "./TraitsForm";
import LocationForm from "./LocationForm";
import EmployerAccountForm from "./EmployerAccountForm"
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ChevronLeft from "../assets/images/ChevronLeft.png";

const SignUp = ({ data, setData, onFinish }) => {
 
    const [step, setstep] = useState(0);
    const [emailFormDone, setEmailFormDone] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const workerSteps = [
        <EmailForm data={data} setData={setData} setIsDone={setEmailFormDone} />,
        <AccountForm data={data} setData={setData} />,
        <PhotoForm data={data} setData={setData} />,
        <SkillsForm data={data} setData={setData} />,
        <ExperienceForm data={data} setData={setData} />,
        <TraitsForm data={data} setData={setData} />,
        <LocationForm data={data} setData={setData} />,
    ];

    const employerSteps = [
        <EmailForm data={data} setData={setData} setIsDone={setEmailFormDone} />,
        <EmployerAccountForm data={data} setData={setData} />,
        <PhotoForm data={data} setData={setData} />,
        <LocationForm data={data} setData={setData} />,
    ];

    const steps = data.accountType === "Worker" ? workerSteps : employerSteps;

    const handlePrevious = () => {
        setstep(step - 1);
    };
    const handleNext = () => {
        setErrorMessage("")
        if (step === 0 && !emailFormDone) {
            setErrorMessage("Email and Password Required");
            return;
        }
        
        setstep(step + 1);
    };

    const validateLocationFields = () => {
        return (
            data.street_address?.trim() &&
            data.city?.trim() &&
            data.province?.trim() &&
            data.postal_code?.trim()
        );
    };

    return (
        <div className="sign-up-container">
            {step === 0 ? (
                <button id="back-button" onClick={() => {
                    if (location.state?.fromAccountSelection) {
                        navigate("/account-selection");
                    } else {
                        navigate("/");
                    }
                }}>
                    <img src={ChevronLeft} alt="Back to home" />
                </button>
            ) : (
                <button id="prev" onClick={handlePrevious}>
                    <img src={ChevronLeft} alt="previous-page" />
                </button>
            )}
            {steps[step]}
            {step !== steps.length - 1 ? (
                <button id={step === 0 ? "next-start" : "next"} onClick={handleNext}>Next</button>
            ) : (
                <button id="finish" onClick={(e) => {
                    e.preventDefault();
                    if (!validateLocationFields()) {
                        setErrorMessage("Please fill out all location fields.");
                        return;
                    }
                    onFinish(e);
                }}>Finish Sign Up</button>
            )}
            {errorMessage && <p className="error-msg">{errorMessage}</p>}
            {step !== 0 && <progress value={(step) / steps.length} />}
            {step === 0 &&
                <div className="other-links">
                    <Link className="signin-link" to="/signin">Already have an account?</Link>
                    <p className="terms">By signing up, you agree with the <Link>Terms of Service</Link> and <Link>Privacy Policy</Link></p>
                </div>
            }
        </div>
    );
}

export default SignUp
