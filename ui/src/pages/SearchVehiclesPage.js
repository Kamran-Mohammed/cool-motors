import "./css/SearchVehicles.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import Alert from "../utils/Alert";
import {
  locations,
  states,
  carMakes,
  fuelTypes,
  transmissions,
  engineTypes,
} from "../utils/data";

const sorts = ["priceAsc", "priceDesc", "odometerAsc", "odometerDesc"];
// MODIFIED: Use objects for sort options for better display
// const sortOptions = [
//   { value: "priceAsc", label: "Price: Low to High" },
//   { value: "priceDesc", label: "Price: High to Low" },
//   { value: "odometerAsc", label: "Odometer: Low to High" }
//   { value: "odometerDesc", label: "Odometer: High to Low" },
// ];

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

  // // NEW: Ref to prevent double-fetching on initial load
  // const initialFetchDone = React.useRef(false);

  const fetchVehicles = useCallback(
    async (activeFilters) => {
      // if (Object.keys(activeFilters).length === 0) return;
      if (Object.keys(activeFilters).length === 0) {
        // NEW: If no filters are present on initial load, fetch all vehicles
        // This ensures the page isn't empty if no search params are in the URL.
        // You can adjust this behavior if you prefer to show nothing until a search is performed.
        if (Object.keys(location.search).length === 0) {
          setLoading(true); // Still show loading
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/v1/vehicles/search`,
              {
                params: { page: pagination.page }, // Fetch all on page 1
                withCredentials: true,
              }
            );
            setVehicles(response.data.data.vehicles);
            setPagination({
              page: response.data.currentPage,
              totalPages: response.data.totalPages,
            });
          } catch (error) {
            console.error("Error fetching vehicles on initial load:", error);
            setVehicles([]);
          } finally {
            setLoading(false);
          }
          return; // Exit after initial fetch
        }
        return; // If filters are empty but it's not initial load, do nothing.
      }

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
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, location.search]
  );

  // Parse query parameters from the URL on page load
  useEffect(() => {
    // if (initialFetchDone.current) return; // Prevent double-fetch on component mount

    const params = new URLSearchParams(location.search);
    const newFilters = {};
    for (const [key, value] of params.entries()) {
      newFilters[key] = value;
    }
    setFilters((prev) => ({ ...prev, ...newFilters }));
    fetchVehicles(newFilters);
    // initialFetchDone.current = true; // Mark initial fetch as done
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

    // If you want to show an alert when no filters are selected, uncomment this:
    // if (Object.keys(activeFilters).length === 0) {
    //   // alert("Please select at least one filter before searching.");
    //   setShowAlert(true);
    //   return;
    // }

    // Always reset to page 1 when new filters are applied
    setPagination((prev) => ({ ...prev, page: 1 }));
    const queryParams = new URLSearchParams(activeFilters);
    navigate(`/search?${queryParams.toString()}`);

    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Adds smooth scrolling
    });
  };

  // NEW: Clear Filters function
  const handleClearFilters = () => {
    const defaultFilters = {
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
    };
    setFilters(defaultFilters);
    setPagination({ page: 1, totalPages: 1 });
    navigate("/search"); // Navigate to base search URL
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage) => {
    // // Ensure current filters are used when changing page
    // const currentActiveFilters = Object.entries(filters).reduce(
    //   (acc, [key, value]) => {
    //     if (value) acc[key] = value;
    //     return acc;
    //   },
    //   {}
    // );
    setPagination((prev) => ({ ...prev, page: newPage }));
    navigate(
      `/search?${new URLSearchParams({ ...filters, page: newPage }).toString()}`
    );
  };

  return (
    <div className="container">
      {/* Filters Section */}
      <div className="filters">
        {/* {Object.entries(filters).map(([key, value]) =>
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
        )} */}
        {Object.entries(filters).map(([key, value]) => {
          // Determine if it's a select or input, and handle datalists
          if (
            [
              "fuelType",
              "transmission",
              "engineType",
              "state",
              "sort",
            ].includes(key)
          ) {
            // Select inputs
            let optionsArray = [];
            let placeholderText = "";

            if (key === "fuelType") {
              optionsArray = fuelTypes;
              placeholderText = "Fuel Type";
            } else if (key === "transmission") {
              optionsArray = transmissions;
              placeholderText = "Transmission";
            } else if (key === "state") {
              optionsArray = states;
              placeholderText = "State";
            } else if (key === "sort") {
              optionsArray = sorts; // Using your 'sorts' array directly
              placeholderText = "Sort By";
            } else if (key === "engineType") {
              optionsArray = engineTypes;
              placeholderText = "Engine Type";
            }

            return (
              <select
                key={key}
                name={key}
                value={value}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">{placeholderText}</option>
                {optionsArray.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            );
          } else {
            // Text/Number inputs with potential datalists
            let inputType = "text";
            let placeholderText = key.charAt(0).toUpperCase() + key.slice(1);
            let datalistId = "";
            if (key === "make") {
              placeholderText = "Brand";
              datalistId = "carMakes"; // Link to carMakes datalist
            } else if (key === "location") {
              placeholderText = "Location";
              datalistId = "locations"; // Link to locations datalist
            }

            return (
              <React.Fragment key={key}>
                <input
                  type={inputType}
                  name={key}
                  value={value}
                  placeholder={placeholderText}
                  onChange={handleInputChange}
                  list={datalistId} // Apply datalist if ID is set
                  className="filter-input"
                />
                {/* Datalist for carMakes */}
                {datalistId === "carMakes" && (
                  <datalist id="carMakes">
                    {carMakes.map((make) => (
                      <option key={make} value={make} />
                    ))}
                  </datalist>
                )}
                {/* Datalist for locations */}
                {datalistId === "locations" && (
                  <datalist id="locations">
                    {locations.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                )}
              </React.Fragment>
            );
          }
        })}
        <button
          className="apply-filter-btn"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
        <button
          className="clear-filter-btn" // NEW: Clear Filters Button
          onClick={handleClearFilters}
          disabled={loading}
        >
          Clear Filters
        </button>
      </div>

      {/* Results Section */}
      <div className="results">
        <h2>Search Results</h2>
        {loading && <p>Loading vehicles...</p>}
        {!loading && vehicles.length === 0 && (
          <p className="no-results-message">
            No vehicles found matching your criteria. Try adjusting your
            filters!
          </p>
        )}
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
