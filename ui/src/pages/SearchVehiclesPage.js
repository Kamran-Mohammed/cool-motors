import "./css/SearchVehicles.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import VehicleCard from "../utils/VehicleCard";
import Alert from "../utils/Alert";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
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

// Price range: 90k to 1.5 crores with 30k increments
const PRICE_MIN = 90000;
const PRICE_MAX = 15000000;
const PRICE_STEP = 30000;

// Odometer range: 0 to 200000+ with 5k increments
const ODO_MIN = 0;
const ODO_MAX = 200000;
const ODO_STEP = 5000;

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
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [odoRange, setOdoRange] = useState([ODO_MIN, ODO_MAX]);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalResults: 0,
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
            totalResults:
              response.data.totalResults || response.data.data.vehicles.length,
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
          totalResults:
            response.data.totalResults || response.data.data.vehicles.length,
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

  const formatPrice = (value) => {
    if (value >= PRICE_MAX) return `₹${(value / 10000000).toFixed(2)}Cr+`;
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const formatOdometer = (value) => {
    if (value >= ODO_MAX) return `${(value / 1000).toFixed(0)}K+`;
    return `${(value / 1000).toFixed(0)}K km`;
  };

  const handlePriceChange = (values) => {
    setPriceRange(values);
    setFilters({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1] >= PRICE_MAX ? "" : values[1],
    });
  };

  const handleOdoChange = (values) => {
    setOdoRange(values);
    setFilters({
      ...filters,
      minOdometer: values[0],
      maxOdometer: values[1] >= ODO_MAX ? "" : values[1],
    });
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
              e.preventDefault();
              handleApplyFilters();
            }}
            className="filters"
          >
            {/* Main Search Filters */}
            <div className="filter-row">
              <input
                type="text"
                name="make"
                value={filters.make}
                placeholder="Brand"
                onChange={handleInputChange}
                list="carMakes"
                className="filter-input"
              />
              <datalist id="carMakes">
                {carMakes.map((make) => (
                  <option key={make} value={make} />
                ))}
              </datalist>

              <input
                type="text"
                name="model"
                value={filters.model}
                placeholder="Model"
                onChange={handleInputChange}
                list="carModels"
                className="filter-input"
              />
              <datalist id="carModels">
                {carModels.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>

              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">Fuel Type</option>
                {fuelTypes.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">Transmission</option>
                {transmissions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <select
                name="engineType"
                value={filters.engineType}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">Engine Type</option>
                {engineTypes.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location, Year and Sort */}
            <div className="filter-row">
              <input
                type="text"
                name="location"
                value={filters.location}
                placeholder="Location"
                onChange={handleInputChange}
                list="locations"
                className="filter-input"
              />
              <datalist id="locations">
                {locations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>

              <select
                name="state"
                value={filters.state}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">State</option>
                {states.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="minYear"
                value={filters.minYear}
                placeholder="Min Year"
                onChange={handleInputChange}
                className="filter-input"
                min={1900}
                max={new Date().getFullYear()}
              />

              <input
                type="number"
                name="maxYear"
                value={filters.maxYear}
                placeholder="Max Year"
                onChange={handleInputChange}
                className="filter-input"
                min={1900}
                max={new Date().getFullYear()}
              />

              <select
                name="sort"
                value={filters.sort}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">Sort By</option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 3: Price and Odometer Sliders */}
            <div className="filter-row slider-row">
              {/* Price Range Slider */}
              <div className="slider-group">
                <label className="slider-label">
                  Price: {formatPrice(priceRange[0])} -{" "}
                  {formatPrice(priceRange[1])}
                </label>
                <Slider
                  range
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={priceRange}
                  onChange={handlePriceChange}
                  trackStyle={[{ backgroundColor: "var(--color-primary)" }]}
                  handleStyle={[
                    {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary)",
                    },
                    {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary)",
                    },
                  ]}
                />
              </div>

              {/* Odometer Range Slider */}
              <div className="slider-group">
                <label className="slider-label">
                  Odometer: {formatOdometer(odoRange[0])} -{" "}
                  {formatOdometer(odoRange[1])}
                </label>
                <Slider
                  range
                  min={ODO_MIN}
                  max={ODO_MAX}
                  step={ODO_STEP}
                  value={odoRange}
                  onChange={handleOdoChange}
                  trackStyle={[{ backgroundColor: "var(--color-primary)" }]}
                  handleStyle={[
                    {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary)",
                    },
                    {
                      borderColor: "var(--color-primary)",
                      backgroundColor: "var(--color-primary)",
                    },
                  ]}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="filter-actions">
              <button
                className="apply-filter-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Loading..." : "Apply Filters"}
              </button>
              <button
                className="clear-filter-btn"
                type="button"
                onClick={handleClearFilters}
                disabled={loading}
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results Section */}
      <div className="results-wrapper">
        <div className="results">
          <div className="results-header">
            <h2>Search Results</h2>
            {!loading && pagination.totalResults > 0 && (
              <span className="results-count">
                {pagination.totalResults}{" "}
                {pagination.totalResults === 1 ? "vehicle" : "vehicles"} found
              </span>
            )}
          </div>
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
