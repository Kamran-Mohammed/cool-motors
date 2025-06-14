import "./css/SearchVehicles.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { states } from "../utils/data";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import Alert from "../utils/Alert";

const fuelTypes = ["petrol", "diesel", "hybrid", "electric", "lpg", "cng"];
const transmissions = ["automatic", "manual"];
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
const sorts = ["priceAsc", "priceDesc", "mileageAsc", "mileageDesc"];

const SearchVehiclesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({
    make: "",
    model: "",
    minYear: "",
    maxYear: "",
    fuelType: "",
    transmission: "",
    minPrice: "",
    maxPrice: "",
    minOdometer: "",
    maxOdometer: "",
    engineType: "",
    location: "",
    state: "",
    sort: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  // const fetchVehicles = async (activeFilters) => {
  //   if (Object.keys(activeFilters).length === 0) return; // Don't fetch if no filters

  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/v1/vehicles/search`,
  //       {
  //         params: activeFilters,
  //         withCredentials: true,
  //       }
  //     );
  //     setVehicles(response.data.data.vehicles);
  //   } catch (error) {
  //     console.error("Error fetching vehicles:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchVehicles = useCallback(
    async (activeFilters) => {
      if (Object.keys(activeFilters).length === 0) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/search`,
          {
            params: { ...activeFilters, page: pagination.page }, // Include page parameter
            withCredentials: true,
          }
        );

        setVehicles(response.data.data.vehicles);
        setPagination({
          page: response.data.currentPage,
          totalPages: response.data.totalPages,
        });
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page]
  );

  // Parse query parameters from the URL on page load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    for (const [key, value] of params.entries()) {
      newFilters[key] = value;
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
    fetchVehicles(newFilters);
  }, [location.search, fetchVehicles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    // Only include filters that have values
    const activeFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      },
      {}
    );

    if (Object.keys(activeFilters).length === 0) {
      // alert("Please select at least one filter before searching.");
      setShowAlert(true);
      return;
    }

    const queryParams = new URLSearchParams(activeFilters);
    navigate(`/search?${queryParams.toString()}`);

    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Adds smooth scrolling
    });
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    navigate(
      `/search?${new URLSearchParams({ ...filters, page: newPage }).toString()}`
    );
  };

  return (
    <div className="container">
      {/* Filters Section */}
      <div className="filters">
        {Object.entries(filters).map(([key, value]) =>
          ["fuelType", "transmission", "engineType", "state", "sort"].includes(
            key
          ) ? (
            <select
              key={key}
              name={key}
              value={value}
              onChange={handleInputChange}
            >
              <option value="">
                {key === "make"
                  ? "Brand"
                  : key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
              {(key === "fuelType"
                ? fuelTypes
                : key === "transmission"
                ? transmissions
                : key === "state"
                ? states
                : key === "sort"
                ? sorts
                : engineTypes
              ).map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={key}
              type={
                [
                  "minYear",
                  "maxYear",
                  "minPrice",
                  "maxPrice",
                  "minOdometer",
                  "maxOdometer",
                ].includes(key)
                  ? "number"
                  : "text"
              }
              name={key}
              value={value}
              // placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              placeholder={
                key === "make"
                  ? "Brand"
                  : key.charAt(0).toUpperCase() + key.slice(1)
              }
              onChange={handleInputChange}
            />
          )
        )}
        <button
          className="apply-filter-btn"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      {/* Results Section */}
      <div className="results">
        <h2>Search Results</h2>
        {vehicles.length !== 0 && (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
      {showAlert && (
        <Alert
          message="Please select at least one filter before searching."
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="pagination">
        <button
          disabled={pagination.page <= 1}
          onClick={() => handlePageChange(pagination.page - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchVehiclesPage;
