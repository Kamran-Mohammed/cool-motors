import "./css/ListVehicle.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Use this for redirection
import { useAuth } from "../AuthContext";
import axios from "axios";
import { locations, states } from "../utils/data";
import Restricted from "../utils/Restricted";
import Alert from "../utils/Alert";
import LoadingModal from "../utils/LoadingModal";

function ListVehicle() {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    fuelType: "",
    transmission: "",
    engineDisplacement: "",
    engineType: "",
    odometer: "",
    ownership: "",
    location: "",
    state: "",
  });

  const { user, loading: authLoading } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const carMakes = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Volkswagen",
    "Nissan",
    "Hyundai",
    "Kia",
    "Mazda",
    "Subaru",
    "Lexus",
    "Jaguar",
    "Land Rover",
    "Volvo",
    "Tesla",
    "Porsche",
    "Ferrari",
    "Lamborghini",
  ];

  const years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => 1900 + i
  );

  const fuelTypes = ["petrol", "diesel", "electric", "hybrid", "CNG", "LPG"];
  const transmissions = ["manual", "automatic"];
  const engineTypes = [
    "Inline 3",
    "Inline 4",
    "Inline 5",
    "Inline 6",
    "V6",
    "V8",
    "V10",
    "V12",
    "V16",
    "W12",
    "w16",
    "Flat 4", //boxer 4
    "Flat 6", //boxer 6
    "rotary",
  ];

  const ownerships = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    // Store selected files in state
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataWithFiles = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataWithFiles.append(key, formData[key]);
      });

      if (selectedFiles) {
        // Append each selected file to the FormData
        selectedFiles.forEach((file) => {
          formDataWithFiles.append("images", file);
        });
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/list`,
        formDataWithFiles,
        {
          withCredentials: true,
        }
      );

      setError("");
      // alert("Details submitted successfully. Please wait for update (email).");
      // navigate("/");
      setShowAlert(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !user) {
    return <Restricted />;
  }

  return (
    <div className="vehicle-list-container">
      {loading && (
        <LoadingModal message="Uploading images. This might take a while..." />
      )}
      <h2 className="form-title">List Vehicle</h2>
      {/* <form className="vehicle-form" onSubmit={handleSubmit}> */}
      <form
        className="vehicle-form"
        onSubmit={handleSubmit}
        style={{
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div className="form-group">
          <label htmlFor="make">
            Brand <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="make"
            list="carMakes"
            value={formData.make}
            onChange={handleChange}
            required
            placeholder="e.g., Skoda"
          />
          <datalist id="carMakes">
            {carMakes.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="model">
            Model <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            placeholder="e.g., Octavia"
          />
        </div>

        <div className="form-group">
          <label htmlFor="variant">Variant</label>
          <input
            type="text"
            name="variant"
            value={formData.variant}
            onChange={handleChange}
            // required
            placeholder="e.g., RS 245"
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">
            Year <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="year"
            list="years"
            value={formData.year}
            onChange={handleChange}
            required
            placeholder="e.g., 2020"
          />
          <datalist id="years">
            {years.map((year) => (
              <option key={year} value={year} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="price">
            Price <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="e.g., 2700000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">
            Fuel Type <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
          >
            <option value="">Select Fuel Type</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="transmission">
            Transmission <span style={{ color: "red" }}>*</span>
          </label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            required
          >
            <option value="">Select Transmission</option>
            {transmissions.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="engineDisplacement">
            Engine Displacement (in liters)
          </label>
          <input
            type="number"
            step="0.1"
            name="engineDisplacement"
            value={formData.engineDisplacement}
            onChange={handleChange}
            placeholder="e.g., 2.0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="engineType">Engine Type</label>
          <select
            name="engineType"
            value={formData.engineType}
            onChange={handleChange}
          >
            <option value="">Select Engine Type</option>
            {engineTypes.map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="odometer">
            Odometer <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            required
            placeholder="e.g., 32000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ownership">
            Ownership <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="ownership"
            list="ownerships"
            value={formData.ownership}
            onChange={handleChange}
            required
            placeholder="e.g., 1"
          />
          <datalist id="ownerships">
            {ownerships.map((num) => (
              <option key={num} value={num} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5" // You can adjust this value to make the text area taller or shorter
            style={{ width: "100%" }}
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation(); // Prevents the form from submitting on Enter
              }
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">
            State <span style={{ color: "red" }}>*</span>
          </label>
          <select
            type="text"
            name="state"
            list="states"
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="">Select state</option>
            {states.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">
            Location <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="location"
            list="locations"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <datalist id="locations">
            {locations.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        {/* IMAGES ------------------------------------------------- */}
        <div className="form-group">
          <label htmlFor="file">
            Upload Images (up to 20) <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="file"
            multiple // Enable multiple file selection
            onChange={handleFileChange}
            required
            accept="image/*" // Accept only image files
          />
          <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
            The first selected image will be used as the cover photo.
          </small>
        </div>
        {/*------------------------------------------------------------ */}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Adding..." : "Add Vehicle"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {showAlert && (
        <Alert
          message={
            "Details submitted successfully. Please wait for update (email)."
          }
          onClose={() => navigate("/")}
        />
      )}
    </div>
  );
}

export default ListVehicle;
