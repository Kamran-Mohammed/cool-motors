import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import slugify from "slugify";
import heart from "./images/heart.png";
import fullHeart from "./images/full-heart.png";
import moreIcon from "./images/more.png";
import "./css/VehicleCard.css";
import { FaGasPump } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { GiGearStickPattern, GiSpeedometer } from "react-icons/gi";

function VehicleCard({ vehicle, showOptions, onEdit, onDelete, onMarkAsSold }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkIfVehicleLiked = async () => {
      if (!vehicle || !vehicle._id || !user) return;
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicle._id}/likes/is-liked`,
          { withCredentials: true }
        );
        setLiked(response.data.data.isLiked);
      } catch (error) {
        console.error("Error checking if vehicle is liked:", error);
      }
    };
    checkIfVehicleLiked();
  }, [vehicle, user]);

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

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (window.confirm("Do you want to Login to like this vehicle?")) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
      return;
    }

    const previousLiked = liked;
    setLiked(!liked);

    try {
      if (previousLiked) {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicle._id}/likes`,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicle._id}/likes`,
          {},
          { withCredentials: true }
        );
      }
      setLiked(!liked);
    } catch (error) {
      setLiked(previousLiked);
      console.error("Error updating like status:", error);
    }
  };

  const slug = slugify(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, {
    lower: true, // convert to lowercase
    strict: true, // strip special chars except hyphens
  });

  return (
    <a
      // href={`/vehicle/${vehicle._id}`}
      href={`/vehicle/${vehicle._id}/${slug}`}
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
          <img
            src={liked ? fullHeart : heart}
            alt="Like"
            className="like-button-vehicle-card"
            onClick={handleLikeToggle}
          />
          {showOptions && (
            <div
              className="vehicle-card-options"
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
                <div className="option-menu">
                  <button className="menu-single-option" onClick={onEdit}>
                    Edit
                  </button>
                  <button className="menu-single-option" onClick={onMarkAsSold}>
                    Mark As Sold
                  </button>
                  <button
                    className="menu-single-option"
                    onClick={onDelete}
                    style={{
                      color: "red",
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
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

          {showOptions && (
            <div className="vehicle-likes">
              <img
                src={fullHeart}
                alt="Likes"
                style={{ width: "14px", height: "14px" }} // Smaller heart icon
              />
              <span style={{ fontSize: "12px", color: "#777" }}>
                {vehicle.numberOfLikes}
              </span>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

export default VehicleCard;
