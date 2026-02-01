import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import { useUser } from "./UserContext";

const ProfilePage = () => {
  const { user, setUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingTraits, setIsEditingTraits] = useState(false);
  const [isEditingExp, setIsEditingExp] = useState(false);
  const [editedUser, setEditedUser] = useState();
  const [submit, setSubmit] = useState(false);
  const [skills, setSkills] = useState([]);
  const [traits, setTraits] = useState([]);
  const [experiences, setExperiences] = useState([]);

  const [workerId, setWorkerId] = useState();
  const [workerSkills, setWorkerSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [workerTraits, setWorkerTraits] = useState([]);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [workerExp, setWorkerExp] = useState([]);
  const [selectedExp, setSelectedExp] = useState([]);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (user) {
      setEditedUser({
        ...user,
        skills: user.skills ? user.skills : [],
      });
    }
  }, [user]);

  useEffect(() => {
    console.log("Profile fetch triggered, user:", user);
    if (user) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/${user.id}`, { withCredentials: true })
        .then((response) => {
          console.log("Profile data:", response.data);
          setUser((prevUser) => ({
            ...prevUser,
            ...response.data.profileData,
            ...response.data.businessData,
          }));
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [submit]);

  useEffect(() => {
    if (!user.isbusiness) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/worker-id/${user.id}`, { withCredentials: true })
        .then((response) => {
          setWorkerId(response.data.id);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [])

  useEffect(() => {
    if (!user.isbusiness && workerId != null) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-worker-skills-id/${workerId}`, { withCredentials: true })
        .then((response) => {
          setWorkerSkills(response.data);
        })
        .catch((error) => {
          console.error("Error fetching worker skills by user id", error);
        });

      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-worker-traits-id/${workerId}`, { withCredentials: true })
        .then((response) => {
          setWorkerTraits(response.data);
        })
        .catch((error) => {
          console.error("Error fetching worker traits by user id", error);
        });

      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-worker-experiences-id/${workerId}`, { withCredentials: true })
        .then((response) => {
          setWorkerExp(response.data);
        })
        .catch((error) => {
          console.error("Error fetching worker experiences by user id", error);
        });
    }
  }, [workerId])

  const fetchProfile = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/${user.id}`, { withCredentials: true })
      .then((response) => {
        let merge = {
          ...response.data.profileData,
          ...response.data.businessData,
        };
        setEditedUser(merge);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };

  const fetchSkills = () => {
    if (!user.isbusiness) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-worker-skills-id/${workerId}`, { withCredentials: true })
        .then((response) => {
          setWorkerSkills(response.data);
        })
        .catch((error) => {
          console.error("Error fetching worker skills by user id", error);
        });
      setSelectedSkills(workerSkills);
    }
  }

  const fetchTraits = () => {
    if (!user.isbusiness) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-worker-traits-id/${workerId}`, { withCredentials: true })
        .then((response) => {
          setWorkerTraits(response.data);
        })
        .catch((error) => {
          console.error("Error fetching worker traits by user id", error);
        });
      setSelectedTraits(workerTraits);
    }
  }

  const fetchExperiences = () => {
    if (!user.isbusiness) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-worker-experiences-id/${workerId}`, { withCredentials: true })
        .then((response) => {
          setWorkerExp(response.data);
        })
        .catch((error) => {
          console.error("Error fetching worker experiences by user id", error);
        });
      setSelectedExp(workerExp);
    }
  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-all-skills`, { withCredentials: true })
      .then((response) => {
        setSkills(response.data);
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
      });

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-all-traits`, { withCredentials: true })
      .then((response) => {
        setTraits(response.data);
      })
      .catch((error) => {
        console.error("Error fetching traits:", error);
      });

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/get-all-experiences`, { withCredentials: true })
      .then((response) => {
        setExperiences(response.data);
      })
      .catch((error) => {
        console.error("Error fetching experiences:", error);
      });
  }, []);

  const handleChange = (event) => {
    const { name, value, options } = event.target;
    if (event.target.type === "select-multiple") {
      const values = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setEditedUser((prev) => ({ ...prev, [name]: values }));
    } else {
      if (name === "desired_work_radius") {
        if (!isNaN(parseInt(value))) {
          setEditedUser((prev) => ({ ...prev, [name]: value }));
        }
      }
      else if (name === "desired_pay") {
        if (!isNaN(parseFloat(value))) {
          var rounded = Math.round(value * 100) / 100
          setEditedUser((prev) => ({ ...prev, [name]: rounded }));
        }
      }
      else {
        setEditedUser((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const toggleEdit = () => {
    fetchProfile();
    setIsEditing(!isEditing);
  };

  const toggleEditSkills = () => {
    fetchSkills();
    setIsEditingSkills(!isEditingSkills);
  }

  const toggleEditTraits = () => {
    fetchTraits();
    setIsEditingTraits(!isEditingTraits);
  }

  const toggleEditExp = () => {
    fetchExperiences();
    setIsEditingExp(!isEditingExp);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmit(true);
    if (!editedUser.skills[0]) {
      return;
    }


    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/profile/update/${user.id}`, editedUser, { withCredentials: true });

      let merge = {
        ...user,
        ...response.data.businessData,
        ...response.data.profileData,
      };
      setIsEditing(false);
      setUser(merge);
      setEditedUser(merge);
    } catch (error) {
      console.error("Update failed:", error.response || error);
    }
  };

  const handleSubmitSkills = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/clear-worker-skills/${workerId}`, { withCredentials: true });
    } catch (error) {
      console.error("Error clearing user skills:", error);
    }

    const submitted = selectedSkills;
    setWorkerSkills(selectedSkills);
    for (const s of submitted) {
      try {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/add-worker-skill-ids/${workerId}/${s.skill_id}`, { withCredentials: true });
      } catch (error) {
        console.error("Error adding skill to worker:", error);
      }
    }

    toggleEditSkills();
  };

  const handleSubmitTraits = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/clear-worker-traits/${workerId}`, { withCredentials: true });
    } catch (error) {
      console.error("Error clearing user traits:", error);
    }

    const submitted = selectedTraits;
    setWorkerTraits(selectedTraits);
    for (const s of submitted) {
      try {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/add-worker-trait-ids/${workerId}/${s.trait_id}`, { withCredentials: true });
      } catch (error) {
        console.error("Error adding trait to user:", error);
      }
    }

    toggleEditTraits();
  };

  const handleSubmitExp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/clear-worker-experiences/${workerId}`, { withCredentials: true });
    } catch (error) {
      console.error("Error clearing user experiences:", error);
    }

    const submitted = selectedExp;
    setWorkerExp(selectedExp);
    for (const s of submitted) {
      try {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/add-worker-experience-ids/${workerId}/${s.experience_id}`, { withCredentials: true });
      } catch (error) {
        console.error("Error adding experience to user:", error);
      }
    }

    toggleEditExp();
  };

  const handleSkillSelect = (skillObj) => {
    if (!selectedSkills.some(o => o.skill_name === skillObj.skill_name)) {
      setSelectedSkills([...selectedSkills, skillObj]);
    } else {
      setSelectedSkills(selectedSkills.filter(item => item.skill_name !== skillObj.skill_name));
    }
  }

  const handleTraitSelect = (traitObj) => {
    if (!selectedTraits.some(o => o.trait_name === traitObj.trait_name)) {
      setSelectedTraits([...selectedTraits, traitObj]);
    } else {
      setSelectedTraits(selectedTraits.filter(item => item.trait_name !== traitObj.trait_name));
    }
  }

  const handleExpSelect = (expObj) => {
    if (!selectedExp.some(o => o.experience_name === expObj.experience_name)) {
      setSelectedExp([...selectedExp, expObj]);
    } else {
      setSelectedExp(selectedExp.filter(item => item.experience_name !== expObj.experience_name));
    }
  }

  if (isEditingSkills) {
    return (
      <div className="user-profile-form">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-sections-container">
            <div className="form-section worker-section">
              <h1>Please Select Applicable Skills</h1>
              <ul>
                {skills.map((skillObj) => <button className={`form-item-button ${selectedSkills.some(o => o.skill_name === skillObj.skill_name) ? "form-item-button-selected" : ""}`}
                  onClick={() => handleSkillSelect(skillObj)}>{skillObj.skill_name}</button>)}
              </ul>
            </div>
          </div>
          <button type="submit" onClick={handleSubmitSkills} className="form-button">
            Save Skills
          </button>
          <button type="button" onClick={toggleEditSkills} className="form-button">
            Cancel
          </button>
        </form>
      </div>
    )
  }

  if (isEditingTraits) {
    return (
      <div className="user-profile-form">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-sections-container">
            <div className="form-section worker-section">
              <h1>Please Select Applicable Traits</h1>
              <ul>
                {traits.map((traitObj) => <button className={`form-item-button ${selectedTraits.some(o => o.trait_name === traitObj.trait_name) ? "form-item-button-selected" : ""}`}
                  onClick={() => handleTraitSelect(traitObj)}>{traitObj.trait_name}</button>)}
              </ul>
            </div>
          </div>
          <button type="submit" onClick={handleSubmitTraits} className="form-button">
            Save Traits
          </button>
          <button type="button" onClick={toggleEditTraits} className="form-button">
            Cancel
          </button>
        </form>
      </div>
    )
  }

  if (isEditingExp) {
    return (
      <div className="user-profile-form">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-sections-container">
            <div className="form-section">
              <h1>Please Select Applicable Experience</h1>
              <ul>
                {experiences.map((expObj) => <button className={`form-item-button ${selectedExp.some(o => o.experience_name === expObj.experience_name) ? "form-item-button-selected" : ""}`}
                  onClick={() => handleExpSelect(expObj)}>{expObj.experience_name}</button>)}
              </ul>
            </div>
          </div>
          <button type="submit" onClick={handleSubmitExp} className="form-button">
            Save Experiences
          </button>
          <button type="button" onClick={toggleEditExp} className="form-button">
            Cancel
          </button>
        </form>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="user-profile-form">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-sections-container">
            {user.isbusiness ? (
              // Employer Section
              <div className="form-section employer-section">
                <>
                  <label htmlFor="business_name" className="form-label">
                    Business Name:
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    value={editedUser.business_name || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label
                    htmlFor="business_phone_number"
                    className="form-label"
                  >
                    Business Phone Number:
                  </label>
                  <input
                    type="text"
                    id="business_phone_number"
                    name="business_phone_number"
                    value={editedUser.business_phone_number || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label htmlFor="business_email" className="form-label">
                    Business Email:
                  </label>
                  <input
                    type="text"
                    id="business_email"
                    name="business_email"
                    value={editedUser.business_email || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label
                    htmlFor="business_street_address"
                    className="form-label"
                  >
                    Business Street Address:
                  </label>
                  <input
                    type="text"
                    id="business_street_address"
                    name="business_street_address"
                    value={editedUser.business_street_address || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label htmlFor="business_city" className="form-label">
                    Business City:
                  </label>
                  <input
                    type="text"
                    id="business_city"
                    name="business_city"
                    value={editedUser.business_city || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label htmlFor="business_province" className="form-label">
                    Business Province:
                  </label>
                  <input
                    type="text"
                    id="business_province"
                    name="business_province"
                    value={editedUser.business_province || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label
                    htmlFor="business_postal_code"
                    className="form-label"
                  >
                    Business Postal Code:
                  </label>
                  <input
                    type="text"
                    id="business_postal_code"
                    name="business_postal_code"
                    value={editedUser.business_postal_code || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label
                    htmlFor="business_description"
                    className="form-label"
                  >
                    Company Bio:
                  </label>
                  <textarea
                    id="business_description"
                    name="business_description"
                    value={editedUser.business_description || ""}
                    onChange={handleChange}
                    className="input-text"
                  />

                  <label htmlFor="business_website" className="form-label">
                    Company Website:
                  </label>
                  <input
                    type="url"
                    id="business_website"
                    name="business_website"
                    value={editedUser.business_website || ""}
                    onChange={handleChange}
                    className="input-text"
                  />
                </>
              </div>
            ) : (
              // Worker Section
              <div className="form-section worker-section">
                <>
                  <label htmlFor="biography" className="form-label">
                    Biography:
                  </label>
                  <textarea
                    id="biography"
                    name="biography"
                    value={editedUser.biography || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="firstname" className="form-label">
                    First Name:
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={editedUser.firstname || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="lastName" className="form-label">
                    Last Name:
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={editedUser.lastname || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="worker_phone_number" className="form-label">
                    Phone Number:
                  </label>
                  <input
                    type="text"
                    id="worker_phone_number"
                    name="worker_phone_number"
                    value={editedUser.worker_phone_number || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label
                    htmlFor="worker_street_address"
                    className="form-label"
                  >
                    Street Adress:
                  </label>
                  <input
                    type="text"
                    id="worker_street_address"
                    name="worker_street_address"
                    value={editedUser.worker_street_address || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="worker_city" className="form-label">
                    City:
                  </label>
                  <input
                    type="text"
                    id="worker_city"
                    name="worker_city"
                    value={editedUser.worker_city || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="worker_province" className="form-label">
                    Province:
                  </label>
                  <input
                    type="text"
                    id="worker_province"
                    name="worker_province"
                    value={editedUser.worker_province || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="worker_postal_code" className="form-label">
                    Postal Code:
                  </label>
                  <input
                    type="text"
                    id="worker_postal_code"
                    name="worker_postal_code"
                    value={editedUser.worker_postal_code || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  <label htmlFor="desired_work_radius" className="form-label">
                    Work Radius (km):
                  </label>
                  <input
                    type="number"
                    id="desired_work_radius"
                    name="desired_work_radius"
                    value={editedUser.desired_work_radius || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />

                  {/*<label htmlFor="skills" className="form-label">
                    Skills:
                  </label>
                  <div className="tags-container">
                    {skills.map((skill) => (
                      <div
                        required
                        key={skill.skill_id}
                        onClick={() => handleSkillChange(skill.skill_name)}
                        className={`tag ${editedUser.skills &&
                          editedUser.skills.includes(skill.skill_name)
                          ? "selected"
                          : ""
                          }`}
                      >
                        {skill.skill_name}
                      </div>
                    ))}
                  </div>*/}

                  <label htmlFor="desired_pay" className="form-label">
                    Desired Pay ($/hr):
                  </label>
                  <input
                    type="number"
                    id="desired_pay"
                    name="desired_pay"
                    value={editedUser.desired_pay || ""}
                    onChange={handleChange}
                    className="input-text"
                    required
                  />
                </>
              </div>
            )}

          </div>

          <button type="submit" className="form-button">
            Save Changes
          </button>
          <button type="button" onClick={toggleEdit} className="form-button">
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return !user ? <div>Loading...</div> : (
    <div className="profile-page">
      <div className="profile-container">
        {user.isbusiness ? (
          <div className="business-profile">
            <div className="profile-section">
              <h2>Business Description</h2>
              <p>{user.business_description || ""}</p>
            </div>

            <div className="profile-section">
              <h2>Business Information</h2>
              <p>
                <strong>Name:</strong> {user.business_name}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone_number}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Address:</strong> {user.street_address} {" "}
                {user.city} {user.province} {" "}
                {user.postal_code}
                {/* ^ might need apostrophes here depending onthe format we pick for addresses*/}
              </p>
              <p>
                <strong>Website:</strong> {user.business_website}
              </p>
            </div>
          </div>
        ) : (
          <div className="worker-profile">
            <div className="profile-section">
              <h2>Biography</h2>
              <p>{user.biography || ""}</p>
            </div>

            <div className="profile-section">
              <h2>Contact Information</h2>
              <p>
                <strong>First Name:</strong> {user.firstname}
              </p>
              <p>
                <strong>Last Name:</strong> {user.lastname}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone number:</strong> {user.phone_number}
              </p>
              <p>
                <strong>Location:</strong> {user.street_address}{" "}
                {user.city} {user.province}{" "}
                {user.postal_code}
                {/* ^ might need apostrophes here depending onthe format we pick for addresses*/}
              </p>
            </div>
            <div className="profile-section">
              <h2>Work Preferences</h2>
              <p>
                <strong>Work Radius:</strong> {user.desired_work_radius} km
              </p>
              <p>
                <strong>Desired Pay (CAD):</strong> ${user.desired_pay}/hr
              </p>
            </div>
          </div>
        )}
        <div className="profile-footer">
          <button onClick={toggleEdit} className="edit-button">
            Edit Profile
          </button>
        </div>
      </div>
      {!user.isbusiness && (
        <>
          <div className="profile-container">
            <div className="profile-section">
              <h2>Skills</h2>
              <ul>
                {workerSkills.map((skillObj) => <div className="displayed-items">{skillObj.skill_name}</div>)}
              </ul>
            </div>
            <p>{user.skills && user.skills.join(", ")}</p>
            <button className="edit-button" onClick={toggleEditSkills}>Edit Skills</button>
          </div>

          <div className="profile-container">
            <div className="profile-section">
              <h2>Experience</h2>
              <ul>
                {workerExp.map((expObj) => <div className="displayed-items">{expObj.experience_name}</div>)}
              </ul>
            </div>
            <p>{user.experiences && user.experiences.join(", ")}</p>
            <button className="edit-button" onClick={toggleEditExp}>Edit Experiences</button>
          </div>

          <div className="profile-container">
            <div className="profile-section">
              <h2>Traits</h2>
              <ul>
                {workerTraits.map((traitObj) => <div className="displayed-items">{traitObj.trait_name}</div>)}
              </ul>
            </div>
            <p>{user.traits && user.traits.join(", ")}</p>
            <button className="edit-button" onClick={toggleEditTraits}>Edit Traits</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
