import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import "./css/HomePage.css";
import HeroSection from "../utils/HeroSection";
import { carMakes, carModels, carMakeModels, states } from "../utils/data";
import { FiFilter } from "react-icons/fi";

const HomePage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(() => window.innerWidth > 600);
  const [homeFilters, setHomeFilters] = useState({
    make: "",
    model: "",
    state: "",
  });

  const availableModels = (() => {
    if (!homeFilters.make) return carModels;
    const matchedKey = Object.keys(carMakeModels).find(
      (k) => k.toLowerCase() === homeFilters.make.toLowerCase(),
    );
    return matchedKey ? carMakeModels[matchedKey] : carModels;
  })();

  const handleHomeFilterChange = (e) => {
    const { name, value } = e.target;
    setHomeFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "make" ? { model: "" } : {}),
    }));
  };

  const handleHomeApplyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (homeFilters.make) params.append("make", homeFilters.make);
    if (homeFilters.model) params.append("model", homeFilters.model);
    if (homeFilters.state) params.append("state", homeFilters.state);
    navigate(`/search?${params.toString()}`);
  };

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
      <div className="home-filters">
        <div className="home-filters-header">
          <span className="home-filters-title">Listings</span>
          <button
            type="button"
            className="home-filters-toggle"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-label="Toggle filters"
          >
            <FiFilter
              className={showFilters ? "filter-icon active" : "filter-icon"}
            />
          </button>
        </div>
        {showFilters && (
          <form className="filter-row" onSubmit={handleHomeApplyFilters}>
            <input
              type="text"
              name="make"
              value={homeFilters.make}
              placeholder="Brand"
              onChange={handleHomeFilterChange}
              list="homeMakes"
              className="filter-input"
            />
            <datalist id="homeMakes">
              {carMakes.map((make) => (
                <option key={make} value={make} />
              ))}
            </datalist>

            <input
              type="text"
              name="model"
              value={homeFilters.model}
              placeholder="Model"
              onChange={handleHomeFilterChange}
              list="homeModels"
              className="filter-input"
            />
            <datalist id="homeModels">
              {availableModels.map((model) => (
                <option key={model} value={model} />
              ))}
            </datalist>

            <select
              name="state"
              value={homeFilters.state}
              onChange={handleHomeFilterChange}
              className={`filter-select ${!homeFilters.state ? "placeholder" : ""}`}
            >
              <option value="">State</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <button type="submit" className="apply-filter-btn">
              Search
            </button>
          </form>
        )}
      </div>
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
