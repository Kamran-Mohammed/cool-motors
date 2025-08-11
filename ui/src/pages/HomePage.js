import React, { useState, useEffect } from "react";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import "./css/HomePage.css";
import HeroSection from "../utils/HeroSection";

const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchRandomVehicles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/random?limit=100`,
          { withCredentials: true }
        );
        setVehicles(response.data.data.vehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchRandomVehicles();
  }, []);

  return (
    <>
      <HeroSection />
      <div className="home-container">
        {/* <h1 className="home-title">Home Page</h1> */}
        {vehicles.length === 0 ? (
          <p>Loading vehicles...</p>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
