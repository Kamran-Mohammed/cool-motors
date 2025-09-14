import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./css/EditVehicle.css";
import Restricted from "../utils/Restricted";
import {
  locations,
  states,
  engineTypes,
  carMakes,
  fuelTypes,
  transmissions,
  years,
  ownerships,
} from "../utils/data";
import Alert from "../utils/Alert";

const EditVehicle = () => {
  const { vehicleId } = useParams();
  const [vehicleData, setVehicleData] = useState(null);
  const [customLocation, setCustomLocation] = useState(""); // For custom location
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!user?._id) return;
      setFetchLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicleId}`,
          {
            withCredentials: true,
          }
        );
        const filteredData = filterFields(response.data.data.vehicle);
        if (user._id !== filteredData.listedBy) {
          // setError("You don't have access to this page.");
          setIsUnauthorized(true);
        }
        delete filteredData.listedBy;
        setVehicleData(filteredData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch vehicle data");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchVehicleData();
  }, [vehicleId, user]);

  const filterFields = (data) => {
    const {
      __v,
      updatedAt,
      images,
      _id,
      numberOfLikes,
      // listedBy,
      createdAt,
      expiresAt,
      isFeatured,
      ...filteredData
    } = data;
    return filteredData;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update location field with custom location if applicable
      const updatedData = { ...vehicleData };
      if (vehicleData.location === "Other") {
        updatedData.location = customLocation;
      }

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicleId}`,
        updatedData,
        {
          withCredentials: true,
        }
      );
      setSuccessMessage("Vehicle updated successfully!");
      setShowAlert(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  if (!authLoading && !user) {
    // navigate("/restricted");
    return <Restricted />;
  }
  // }, [user, authLoading]);

  if (fetchLoading) return <div>Loading...</div>;
  if (!vehicleData) return <div>Loading vehicle data...</div>;
  if (isUnauthorized) return <p>You don't have access to this vehicle.</p>;

  return (
    <div className="edit-vehicle-container">
      <h2>Edit Vehicle</h2>
      {/* {successMessage && (
        <div className="success-message">{successMessage}</div>
        )} */}
      <form
        onSubmit={handleUpdate}
        className="edit-vehicle-form"
        style={{
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {Object.keys(vehicleData).map((key) => (
          <div key={key} className="form-group">
            <label htmlFor={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </label>
            {key === "make" ? (
              <>
                <input
                  type="text"
                  name="make"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="carMakes" // Ensure the list is correctly linked
                  required
                />
                <datalist id="carMakes">
                  {carMakes.map((make) => (
                    <option key={make} value={make} />
                  ))}
                </datalist>
              </>
            ) : key === "year" ? (
              <>
                <input
                  type="text"
                  name="year"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="years"
                  required
                />
                <datalist id="years">
                  {years.map((year) => (
                    <option key={year} value={year} />
                  ))}
                </datalist>
              </>
            ) : key === "transmission" ? (
              <>
                <input
                  type="text"
                  name="transmission"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="transmissions"
                  required
                />
                <datalist id="transmissions">
                  {transmissions.map((transmission) => (
                    <option key={transmission} value={transmission} />
                  ))}
                </datalist>
              </>
            ) : key === "ownership" ? (
              <>
                <input
                  type="text"
                  name="ownership"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="ownerships"
                  required
                />
                <datalist id="ownerships">
                  {ownerships.map((ownership) => (
                    <option key={ownership} value={ownership} />
                  ))}
                </datalist>
              </>
            ) : key === "engineType" ? (
              <>
                <input
                  type="text"
                  name="engineType"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="engineTypes"
                  required
                />
                <datalist id="engineTypes">
                  {engineTypes.map((engine) => (
                    <option key={engine} value={engine} />
                  ))}
                </datalist>
              </>
            ) : key === "fuelType" ? (
              <>
                <input
                  type="text"
                  name="fuelType"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="fuelTypes"
                  required
                />
                <datalist id="fuelTypes">
                  {fuelTypes.map((fuel) => (
                    <option key={fuel} value={fuel} />
                  ))}
                </datalist>
              </>
            ) : key === "state" ? (
              <>
                <input
                  type="text"
                  name="state"
                  value={vehicleData[key]}
                  onChange={handleInputChange}
                  className="form-input"
                  list="states"
                  required
                />
                <datalist id="states">
                  {states.map((fuel) => (
                    <option key={fuel} value={fuel} />
                  ))}
                </datalist>
              </>
            ) : key === "location" ? (
              <>
                <input
                  type="text"
                  name="location"
                  value={vehicleData[key]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setVehicleData((prevData) => ({
                      ...prevData,
                      location: value,
                    }));
                    if (value !== "Other") {
                      setCustomLocation(""); // Clear custom location
                    }
                  }}
                  className="form-input"
                  list="locations"
                  required
                />
                <datalist id="locations">
                  {locations.map((location) => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
                {vehicleData.location === "Other" && (
                  <input
                    type="text"
                    name="customLocation"
                    value={customLocation}
                    placeholder="Enter custom location"
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="form-input"
                  />
                )}
              </>
            ) : (
              <input
                type={typeof vehicleData[key] === "number" ? "number" : "text"}
                id={key}
                name={key}
                value={vehicleData[key]}
                placeholder={`Enter ${key}`}
                onChange={handleInputChange}
                className="form-input"
              />
            )}
          </div>
        ))}
        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="update-button" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
      {showAlert && (
        <Alert
          message={successMessage}
          onClose={() => navigate("/my-vehicles")}
        />
      )}
    </div>
  );
};

export default EditVehicle;
