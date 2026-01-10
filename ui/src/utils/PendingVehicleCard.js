import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../AuthContext";
// import axios from "axios";
import { FaGasPump } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { GiGearStickPattern, GiSpeedometer } from "react-icons/gi";

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
      <div className="vehicle-card" key={vehicle._id}>
        <div className="vehicle-card-image">
          <img
            src={
              vehicle.images && vehicle.images.length > 0
                ? vehicle.images[0]
                : "placeholder.jpg"
            }
            alt={`${vehicle.make} ${vehicle.model}`}
          />
        </div>

        <div className="vehicle-details-wrapper">
          <h2 className="vehicle-title">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>

          <h1 className="vehicle-price">
            ₹{vehicle.price.toLocaleString("en-IN")}
          </h1>

          {/* <p className="vehicle-odometer">
                      {vehicle.odometer.toLocaleString("en-IN")} km
                    </p>
          
                    <p className="vehicle-location">
                      {vehicle.location}, {vehicle.state}
                    </p> */}
          <div className="vehicle-info-row">
            <div className="vehicle-info-left">
              <span>
                <MdLocationOn /> {vehicle.location}, {vehicle.state}
              </span>
              <span>
                <GiSpeedometer /> {vehicle.odometer.toLocaleString("en-IN")} km
              </span>
            </div>
            <div className="vehicle-info-right">
              <span>
                <FaGasPump /> {vehicle.fuelType}
              </span>
              <span>
                <GiGearStickPattern /> {vehicle.transmission}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export default PendingVehicleCard;
