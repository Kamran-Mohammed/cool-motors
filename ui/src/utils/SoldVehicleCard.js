import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../AuthContext";
// import axios from "axios";
import moreIcon from "./images/more.png";

function SoldVehicleCard({ vehicle, showOptions, onDelete }) {
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
      href={`/sold-vehicle/${vehicle._id}`}
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
          opacity: "0.6",
          filter: "grayscale(50%)",
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
            }}
          />
          {showOptions && (
            <div
              className="vehicle-card-options"
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "5px",
                padding: "5px",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
            >
              <img
                src={moreIcon}
                alt="Options"
                style={{ width: "20px", height: "20px" }}
              />
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "25px",
                    right: "0",
                    background: "white",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "5px",
                    overflow: "hidden",
                    minWidth: "95px",
                    zIndex: 10,
                    width: "auto",
                  }}
                >
                  {onDelete ? (
                    <button
                      onClick={onDelete}
                      style={{
                        display: "block",
                        padding: "8px 12px",
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "red",
                      }}
                    >
                      Delete
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              )}
            </div>
          )}
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

export default SoldVehicleCard;
