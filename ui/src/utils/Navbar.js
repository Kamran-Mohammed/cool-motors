import "./css/Navbar.css";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import userIcon from "./images/user.png";
import plusIcon from "./images/plus.png"; // Add a plus icon
import AFSmall from "./images/af_small_logo.png";
import AFLogoSBS from "./images/af_logo_sbs.png";

const Navbar = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  // NEW: State for the universal search input
  // const [searchQuery, setSearchQuery] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSellClick = (e) => {
    e.preventDefault();

    if (!user) {
      if (window.confirm("Do you want to Login to list your vehicle?")) {
        navigate(`/login?redirect=/list`);
      }
    } else {
      navigate("/list");
    }
  };

  // // NEW: Handle universal search submission
  // const handleSearchSubmit = (e) => {
  //   e.preventDefault(); // Prevent form default submission if it's a form

  //   if (searchQuery.trim()) {
  //     // Only navigate if query is not empty
  //     navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
  //     setSearchQuery(""); // Clear search bar after submission
  //   }
  // };

  // // NEW: Handle Enter key press in search input
  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     handleSearchSubmit(e);
  //   }
  // };

  return (
    <header className="header">
      {/* <div className="nav-links"> */}
      <div className="nav-left">
        <Link to="/" className="home-link">
          <img src={AFLogoSBS} className="logo-large" alt="Logo Large" />
          <img src={AFSmall} className="logo-small" alt="Logo Small" />
        </Link>
        <Link to="/search" className="nav-link">
          Search
        </Link>
      </div>
      {/* NEW: Universal Search Bar */}
      {/* <div className="nav-search-container">
        <input
          type="text"
          placeholder="Search by make, model, fuel type, year..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown} // Listen for Enter key
        />
        <button className="search-button" onClick={handleSearchSubmit}>
          Search
        </button>
      </div> */}

      <div className="nav-center">
        <button className="list-vehicle-btn" onClick={handleSellClick}>
          <img src={plusIcon} alt="List Vehicle" className="plus-icon" />
          <span>Sell</span>
        </button>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-menu-title" onClick={toggleDropdown}>
              <img src={userIcon} alt="User Icon" className="user-icon" />
              {user.name || "User Menu"}
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/my-vehicles" className="dropdown-link">
                  My Vehicles
                </Link>
                <Link to="/liked-vehicles" className="dropdown-link">
                  Liked Vehicles
                </Link>
                <Link to="/settings" className="dropdown-link">
                  Settings
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;

<button className="list-vehicle-btn">
  <img src={plusIcon} alt="List Vehicle" className="plus-icon" />
  <span>Sell</span>
</button>;
