import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import Link for navigation
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./css/ReviewVehicles.css";

const ReviewVehicles = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5001/api/v1/pending-vehicles/oldest",
        {
          withCredentials: true,
        }
      );
      if (!response.data.data.vehicle) {
        setError("No pending vehicles");
        setLoading(false);
        return;
      }
      setVehicle(response.data.data.vehicle);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch vehicle");
      if (err.response.status === 403) {
        setError("You Don't have access to this page");
      }
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!vehicle) return;
    try {
      await axios.post(
        `http://localhost:5001/api/v1/pending-vehicles/${vehicle._id}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
      fetchVehicle(); // Fetch next vehicle after approval
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve vehicle");
    }
  };

  const handleDisapprove = async () => {
    if (!vehicle) return;
    try {
      await axios.delete(
        `http://localhost:5001/api/v1/pending-vehicles/${vehicle._id}/disapprove`,
        {
          withCredentials: true,
        }
      );
      fetchVehicle(); // Fetch next vehicle after disapproval
    } catch (err) {
      setError("Failed to disapprove vehicle");
    }
  };

  if (!user) {
    navigate("/restricted");
    return;
  }

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        <h2 align="center">{error}</h2>
      </div>
    );

  return (
    <div className="admin-slideshow">
      <div className="vehicle-slide">
        <img
          src={vehicle.images[0] || "placeholder.jpg"}
          alt={vehicle.name}
          className="vehicle-image"
        />
        <div className="vehicle-info">
          <p>
            <strong>Make:</strong> {vehicle.make}
          </p>
          <p>
            <strong>Model:</strong> {vehicle.model}
          </p>
          <p>
            <strong>Year:</strong> {vehicle.year}
          </p>
          <p>
            <strong>Price:</strong> ₹{vehicle.price}
          </p>
          <p>
            <strong>Fuel Type:</strong> {vehicle.fuelType}
          </p>
          <p>
            <strong>Transmission:</strong> {vehicle.transmission}
          </p>
          <p>
            <strong>Engine Displacement:</strong> {vehicle.engineDisplacement}L
          </p>
          <p>
            <strong>Engine Type:</strong> {vehicle.engineType}
          </p>
          <p>
            <strong>Odometer:</strong> {vehicle.odometer} km
          </p>
          <p>
            <strong>Ownership:</strong> {vehicle.ownership} Owners
          </p>
          <p>
            <strong>State:</strong> {vehicle.state}
          </p>
          <p>
            <strong>Location:</strong> {vehicle.location}
          </p>
          <p>
            <strong>Description:</strong> {vehicle.description}
          </p>
        </div>
        <div className="action-buttons">
          <button onClick={handleApprove} className="approve-btn">
            Approve
          </button>
          <button onClick={handleDisapprove} className="disapprove-btn">
            Disapprove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewVehicles;
