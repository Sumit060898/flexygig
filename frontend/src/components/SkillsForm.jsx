import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/SkillsForm.css";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";

const SkillsForm = ({ data, setData }) => {
    const [search, setSearch] = useState("");
    const [selectedSkills, setSelectedSkills] = useState(data.skills || []);
    const [errorMessage, setErrorMessage] = useState("");
    const [allSkills, setAllSkills] = useState([]);

    useEffect(() => {
        const getAllSkills = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/get-all-skills`, { withCredentials: true });
                const resData = res.data;

                if (resData && typeof resData === "object") {
                    setAllSkills(resData);
                } else {
                    setErrorMessage("Data is not an object: " + resData);
                }
            } catch (err) {
                setErrorMessage("Failure to get skills: " + err);
            }
        };

        getAllSkills();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSelectSkill = (skillName) => {
        const skillToAdd = allSkills.find(item => item.skill_name === skillName);

        if (skillToAdd && !selectedSkills.some(s => s.skill_name === skillName)) {
            const updatedSkills = [...selectedSkills, skillToAdd];
            setSelectedSkills(updatedSkills);
            setData({ ...data, skills: updatedSkills });
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        const updatedSkills = selectedSkills.filter(s => s.skill_id !== skillToRemove.skill_id);
        setSelectedSkills(updatedSkills);
        setData({ ...data, skills: updatedSkills });
    };

    return (
        <div className="skills-form-container">
            {errorMessage && <p style={{ justifySelf: "center", color: "red" }}>{errorMessage}</p>}
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h2 className="skills-form-title">Build Your Skill Profile</h2>
            <label className="skills-form-label" htmlFor="skill-search">Search</label>
            <input
                type="text"
                id="skill-search"
                className="skills-form-search"
                placeholder="Search skills..."
                value={search}
                onChange={handleSearchChange}
            />

            <h3 className="skills-form-subtitle">Top Valuable Skills</h3>
            <div className="skills-form-skills-list">
                {allSkills.map((skill) => (
                    <button
                        key={skill.skill_id}
                        className={`skills-form-skill-button ${selectedSkills.some(s => s.skill_name === skill.skill_name) ? "selected" : ""}`}
                        onClick={() => handleSelectSkill(skill.skill_name)}
                    >
                        {skill.skill_name}
                    </button>
                ))}
            </div>

            <h3 className="skills-form-subtitle">My Skills</h3>
            <div className="skills-form-selected-skills">
                {selectedSkills.length > 0 ? (
                    selectedSkills.map((skill) => (
                        <div key={skill.skill_id} className="skills-form-selected-skill">
                            {skill.skill_name}
                            <button onClick={() => handleRemoveSkill(skill)}>x</button>
                        </div>
                    ))
                ) : (
                    <p>No skills selected</p>
                )}
            </div>
        </div>
    );
};

export default SkillsForm;
