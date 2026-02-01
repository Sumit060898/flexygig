import "../styles/EmailForm.css";
import { useEffect, useState } from "react";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";

const EmailForm = ({ data, setData, setIsDone }) => {
    const [validEmail, setValidEmail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const validateEmail = () => {
            const tester = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!tester.test(data.email)) {
                if (!data.email) setEmailError("");
                else setEmailError("Please enter a valid email");
                setValidEmail(false);
                return;
            }
            setEmailError("");
            setValidEmail(true);
        };
        validateEmail();
    }, [data.email]);

    useEffect(() => {
        const validatePassword = () => {
            // Password validation
            const capitalRegex = /[A-Z]/;
            const numberRegex = /[0-9]/;
            const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
            const minLength = 8;

            if (
                data.password.length < minLength ||
                !capitalRegex.test(data.password) ||
                !numberRegex.test(data.password) ||
                !specialCharRegex.test(data.password)
            ) {
                if (!data.password) setPasswordError("");
                else setPasswordError(
                    "Password must be at least 8 characters long and contain 1 capital letter, 1 number, and 1 special character."
                );
                setValidPassword(false);
                return;
            }
            setPasswordError("");
            setValidPassword(true);
        };
        validatePassword();
    }, [data.password]);

    useEffect(() => { setIsDone(validEmail && validPassword); }, [setIsDone, validEmail, validPassword]);





    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    return (
        <div className="email-form-container">
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h1 id="heading">
                {data.accountType === "Worker" ? "Sign Up as a Worker" : "Sign Up as an Employer"}
            </h1>
            <form>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
                {!validEmail && <p className="error-msg">{emailError}</p>}
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                />
                {!validPassword && <p className="error-msg">{passwordError}</p>}
            </form>
        </div>
    );
}
 
export default EmailForm;
