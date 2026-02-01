import React from 'react';
import "../styles/Toggle.css";

const Toggle = ({ isEnabled, onToggle }) => {
  return (
    <label className="switch">
      <input type="checkbox" checked={isEnabled} onChange={onToggle} />
      <span className="slider"></span>
    </label>
  );
};

export default Toggle;