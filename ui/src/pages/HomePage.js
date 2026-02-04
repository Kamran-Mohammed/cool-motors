import React, { useState, useEffect } from "react";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import "./css/HomePage.css";
import HeroSection from "../utils/HeroSection";

const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const excludeIds = vehicles.map((v) => v._id);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/vehicles/random?limit=40`,
        { exclude: excludeIds },
        { withCredentials: true },
      );
      const newVehicles = response.data.data.vehicles;
      setVehicles([...vehicles, ...newVehicles]);
      setHasMore(newVehicles.length === 40);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <>
      <HeroSection />
      <div className="home-container">
        {vehicles.length === 0 && !loading ? (
          <p>Loading vehicles...</p>
        ) : (
          <>
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
            {hasMore && (
              <div className="load-more-container">
                <button
                  className="load-more-btn"
                  onClick={fetchVehicles}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;
