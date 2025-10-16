import "./css/SearchVehicles.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import Alert from "../utils/Alert";
// import { parseSearchQuery } from "../utils/searchUtils";
import {
  locations,
  states,
  carMakes,
  carModels,
  fuelTypes,
  transmissions,
  engineTypes,
} from "../utils/data";

// MODIFIED: Use objects for sort options with labels
const sortOptions = [
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "odometerAsc", label: "Odometer: Low to High" },
  { value: "odometerDesc", label: "Odometer: High to Low" },
  { value: "DateNto", label: "Date Listed: Newest First" },
  { value: "dateOtn", label: "Date Listed: Oldest First" },
];

const DEFAULT_FILTERS = {
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
  sort: "DateNto", // Keep the default sort value here
};

const SearchVehiclesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  // const [showFilters, setShowFilters] = useState(true);
  const [showFilters, setShowFilters] = useState(() => window.innerWidth > 600);

  const fetchVehicles = useCallback(
    async (activeFilters) => {
      // If no filters are present on initial load, fetch all vehicles.
      if (Object.keys(activeFilters).length === 0 && !location.search) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/vehicles/search`,
            {
              params: { page: pagination.page, sort: "DateNto" }, // 👈 added sort
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
        return;
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    for (const [key, value] of params.entries()) {
      newFilters[key] = value;
    }

    // FIX: Overwrite existing state with DEFAULT_FILTERS + new parameters.
    // This resets any filters not present in the new URL (e.g., an old model) back to "".
    setFilters({
      ...DEFAULT_FILTERS,
      ...newFilters,
    });

    // Determine which filters to use for the API call: newFilters, or the default sort for base search.
    const filtersForFetch =
      Object.keys(newFilters).length > 0
        ? newFilters
        : { sort: DEFAULT_FILTERS.sort };

    fetchVehicles(filtersForFetch);
  }, [location.search, fetchVehicles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      },
      {}
    );

    setPagination((prev) => ({ ...prev, page: 1 }));
    const queryParams = new URLSearchParams(activeFilters);
    navigate(`/search?${queryParams.toString()}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
    setPagination((prev) => ({ ...prev, page: newPage }));
    navigate(
      `/search?${new URLSearchParams({ ...filters, page: newPage }).toString()}`
    );
  };

  return (
    <div className="search-vehicles-container">
      <div className="filters-toggle">
        <button onClick={() => setShowFilters((prev) => !prev)}>
          {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
        </button>
      </div>
      {showFilters && (
        <div className="filters-wrapper">
          {/* Filters Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // prevent page reload
              handleApplyFilters(); // trigger search
            }}
            className="filters"
          >
            {Object.entries(filters).map(([key, value]) => {
              if (
                [
                  "fuelType",
                  "transmission",
                  "engineType",
                  "state",
                  "sort",
                ].includes(key)
              ) {
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
                  // MODIFIED: Use sortOptions with labels
                  optionsArray = sortOptions;
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
                      <option
                        key={option.value || option}
                        value={option.value || option}
                      >
                        {option.label ||
                          option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                );
              } else {
                let inputType = "text";
                let placeholderText =
                  key.charAt(0).toUpperCase() + key.slice(1);
                let datalistId = "";

                if (key === "make") {
                  placeholderText = "Brand";
                  datalistId = "carMakes";
                } else if (key === "location") {
                  placeholderText = "Location";
                  datalistId = "locations";
                } else if (key === "model") {
                  placeholderText = "Model";
                  datalistId = "carModels";
                } else if (
                  [
                    "minYear",
                    "maxYear",
                    "minPrice",
                    "maxPrice",
                    "minOdometer",
                    "maxOdometer",
                  ].includes(key)
                ) {
                  inputType = "number";
                } else {
                  return null;
                }

                return (
                  <React.Fragment key={key}>
                    <input
                      type={inputType}
                      name={key}
                      value={value}
                      placeholder={placeholderText}
                      onChange={handleInputChange}
                      list={datalistId}
                      className="filter-input"
                    />
                    {datalistId === "carMakes" && (
                      <datalist id="carMakes">
                        {carMakes.map((make) => (
                          <option key={make} value={make} />
                        ))}
                      </datalist>
                    )}
                    {datalistId === "locations" && (
                      <datalist id="locations">
                        {locations.map((loc) => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                    )}
                    {datalistId === "carModels" && (
                      <datalist id="carModels">
                        {carModels.map((model) => (
                          <option key={model} value={model} />
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
              className="clear-filter-btn"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </form>
        </div>
      )}

      {/* Results Section */}
      <div className="results-wrapper">
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
    </div>
  );
};

export default SearchVehiclesPage;
