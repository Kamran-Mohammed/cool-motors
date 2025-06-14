import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../AuthContext";
// import axios from "axios";

function PendingVehicleCard({ vehicle, showOptions, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // const { user } = useAuth();
  // const navigate = useNavigate();
  // const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest(".vehicle-card-options")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <a
      href={`/admin/pending-vehicle/${vehicle._id}`}
      // target="_blank"
      // rel="noopener noreferrer"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        key={vehicle._id}
        style={{
          border: "1px solid #ccc",
          cursor: "pointer",
          // textAlign: "center",
          borderRadius: "10px",
          overflow: "hidden",
          transition: "background-color 0.3s ease",
          backgroundColor: "white",
          //   opacity: "0.6",
          //   filter: "grayscale(50%)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "200px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={
              vehicle.images && vehicle.images.length > 0
                ? vehicle.images[0]
                : "placeholder.jpg"
            }
            alt={`${vehicle.make} ${vehicle.model}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 0.3s ease",
              // opacity: isHovered ? 0.7 : 1,
            }}
          />
        </div>

        <div style={{ padding: "10px", position: "relative" }}>
          {/* Car Title */}
          <h2
            style={{
              margin: "10px 0 0 0",
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>

          {/* Price (Bigger than name) */}
          <h1
            style={{
              margin: "5px 0",
              fontSize: "20px",
              color: "#333",
              textAlign: "left",
            }}
          >
            ₹{vehicle.price.toLocaleString("en-IN")}
          </h1>

          {/* Odometer Reading (Small Font) */}
          <p
            style={{
              margin: "2px 0",
              fontSize: "12px",
              color: "#666",
              textAlign: "left",
            }}
          >
            {vehicle.odometer.toLocaleString("en-IN")} km
          </p>

          {/* Location & State (Grayish) */}
          <p
            style={{
              margin: "2px 0 10px",
              fontSize: "12px",
              color: "#777",
              textAlign: "left",
            }}
          >
            {vehicle.location}, {vehicle.state}
          </p>
        </div>
      </div>
    </a>
  );
}

export default PendingVehicleCard;
