import React, { useEffect, useState } from "react";
import axios from 'axios';
import "../styles/TraitsForm.css";
import FlexygigLogo from "../assets/images/FlexygigLogo.png";

const TraitsForm = ({ data, setData }) => {
    const [search, setSearch] = useState("");
    const [selectedTraits, setSelectedTraits] = useState(data.traits || []);
    const [errorMessage, setErrorMessage] = useState("");
    const [allTraits, setAllTraits] = useState([]);

    useEffect(() => {
        const getAllTraits = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/get-all-traits`, { withCredentials: true });
                const resData = res.data;

                if (resData && typeof resData === "object") {
                    setAllTraits(resData);
                } else {
                    setErrorMessage("Data is not an object: " + resData);
                }
            } catch (err) {
                setErrorMessage("Failure to get traits: " + err);
            }
        };

        getAllTraits();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSelectTrait = (traitName) => {
        const traitToAdd = allTraits.find(item => item.trait_name === traitName);

        if (traitToAdd && !selectedTraits.some(t => t.trait_name === traitName)) {
            const updatedTraits = [...selectedTraits, traitToAdd];
            setSelectedTraits(updatedTraits);
            setData({ ...data, traits: updatedTraits });
        }
    };

    const handleRemoveTrait = (traitToRemove) => {
        const updatedTraits = selectedTraits.filter(t => t.trait_id !== traitToRemove.trait_id);
        setSelectedTraits(updatedTraits);
        setData({ ...data, traits: updatedTraits });
    };


    return (
        <div className="traits-form-container">
            {errorMessage && <p style={{ justifySelf: "center", color: "red" }}>{errorMessage}</p>}
            <img className="image" src={FlexygigLogo} alt="flexygig-icon" />
            <h2 className="traits-form-title">Build Your Trait Profile</h2>
            <label className="traits-form-label" htmlFor="trait-search">Search</label>
            <input
                type="text"
                id="trait-search"
                className="traits-form-search"
                placeholder="Search traits..."
                value={search}
                onChange={handleSearchChange}
            />

            <h3 className="traits-form-subtitle">Top Valuable Traits</h3>
            <div className="traits-form-traits-list">
                {allTraits.map((trait) => (
                    <button
                        key={trait.trait_id}
                        className={`traits-form-trait-button ${selectedTraits.some(t => t.trait_name === trait.trait_name) ? "selected" : ""}`}
                        onClick={() => handleSelectTrait(trait.trait_name)}
                    >
                        {trait.trait_name}
                    </button>
                ))}
            </div>

            <h3 className="traits-form-subtitle">My Traits</h3>
            <div className="traits-form-selected-traits">
                {selectedTraits.length > 0 ? (
                    selectedTraits.map((trait) => (
                        <div key={trait.trait_id} className="traits-form-selected-trait">
                            {trait.trait_name}
                            <button onClick={() => handleRemoveTrait(trait)}>x</button>
                        </div>
                    ))
                ) : (
                    <p className="traits-form-no-traits">No traits selected</p>
                )}
            </div>
        </div>
    );
}

export default TraitsForm;
