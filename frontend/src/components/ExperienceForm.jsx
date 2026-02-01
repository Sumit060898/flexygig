import React, { useEffect, useState } from "react";
import axios from 'axios';
import "../styles/ExperienceForm.css";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";

const ExperienceForm = ({ data, setData }) => {
    const [search, setSearch] = useState("");
    const [selectedExperiences, setSelectedExperiences] = useState(data.experience || []);
    const [errorMessage, setErrorMessage] = useState("");
    const [allExperiences, setAllExperiences] = useState([]);

    useEffect(() => {
        const getAllExperiences = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/get-all-experiences`, { withCredentials: true });
                const resData = res.data;

                if (resData && typeof resData === "object") {
                    setAllExperiences(resData);
                } else {
                    setErrorMessage("Data is not an object: " + resData);
                }
            } catch (err) {
                setErrorMessage("Failure to get experiences: " + err);
            }
        };

        getAllExperiences();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSelectExperience = (experienceName) => {
        const experienceToAdd = allExperiences.find(item => item.experience_name === experienceName);

        if (experienceToAdd && !selectedExperiences.some(exp => exp.experience_name === experienceName)) {
            const updatedExperiences = [...selectedExperiences, experienceToAdd];
            setSelectedExperiences(updatedExperiences);
            setData({ ...data, experiences: updatedExperiences });
        }
    };

    const handleRemoveExperience = (experienceToRemove) => {
        const updatedExperiences = selectedExperiences.filter(exp => exp.experience_id !== experienceToRemove.experience_id);
        setSelectedExperiences(updatedExperiences);
        setData({ ...data, experiences: updatedExperiences });
    };

    return (
        <div className="experience-form-container">
            {errorMessage && <p style={{ justifySelf: "center", color: "red" }}>{errorMessage}</p>}
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h2 className="experience-form-title">Experience Showcase</h2>
            <label className="experience-form-label" htmlFor="job-search">Search</label>
            <input
                type="text"
                id="job-search"
                className="experience-form-search"
                placeholder="Search jobs..."
                value={search}
                onChange={handleSearchChange}
            />

            <h3 className="experience-form-subtitle">Popular Jobs</h3>
            <div className="experience-form-jobs-list">
                {allExperiences.map((experience) => (
                    <button
                        key={experience.experience_id}
                        className={`experience-form-job-button ${selectedExperiences.some(exp => exp.experience_name === experience.experience_name) ? "selected" : ""}`}
                        onClick={() => handleSelectExperience(experience.experience_name)}
                    >
                        {experience.experience_name}
                    </button>
                ))}
            </div>

            <h3 className="experience-form-subtitle">My Jobs</h3>
            <div className="experience-form-selected-jobs">
                {selectedExperiences.length > 0 ? (
                    selectedExperiences.map((experience) => (
                        <div key={experience.experience_id} className="experience-form-selected-job">
                            {experience.experience_name}
                            <button onClick={() => handleRemoveExperience(experience)}>x</button>
                        </div>
                    ))
                ) : (
                    <p>No Experinece selected</p>
                )}
            </div>
        </div>
    );
}

export default ExperienceForm;
