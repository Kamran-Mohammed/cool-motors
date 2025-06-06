import React from "react";
import "./css/Modal.css"; // Shared styles for Alert & Confirmation

const Alert = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="info-modal-content">
        <p>{message}</p>
        <button className="btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default Alert;
