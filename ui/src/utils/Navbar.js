import "./css/Navbar.css";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import userIcon from "./images/user.png";
// import plusIcon from "./images/plus.png";
// import AFSmall from "./images/af_small_logo.png";
import AFLogoSBS from "./images/af_logo_sbs_blue.png";
import { FiSearch, FiPlus } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { parseSearchQuery } from "../utils/searchUtils";

const Navbar = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleHamburger = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsHamburgerOpen(false);
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

  // MODIFIED: Handle universal search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const rawInput = searchQuery.trim();

    if (rawInput) {
      // 1. Parse the raw text into structured filters
      const parsedFilters = parseSearchQuery(rawInput);
      parsedFilters.sort = "DateNto";
      // 2. Navigate with the clean, structured parameters
      const queryParams = new URLSearchParams(parsedFilters);
      navigate(`/search?${queryParams.toString()}`);

      // setSearchQuery(""); // Clear input after submission
    } else {
      // If the input is empty, navigate to the base search page
      navigate("/search");
    }

    setIsHamburgerOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="nav-left">
          <Link to="/" className="home-link">
            <img src={AFLogoSBS} className="logo-large" alt="Logo Large" />
            {/* <img src={AFSmall} className="logo-small" alt="Logo Small" /> */}
          </Link>
        </div>

        <div className="nav-search-wrapper">
          <form onSubmit={handleSearch} className="search-form-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search Vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn">
              <FiSearch className="search-icon" />
              {/* <span className="search-text-btn">Search</span> */}
            </button>
          </form>
        </div>

        <div className="nav-center">
          <button className="list-vehicle-btn" onClick={handleSellClick}>
            <FiPlus className="plus-icon" />
            <span>Sell</span>
          </button>
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="search-mobile"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <FiSearch className="search-icon" />
          </button>
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div className="user-menu-title" onClick={toggleDropdown}>
                <img src={userIcon} alt="User Icon" className="user-icon" />
                {user.name || "User Menu"}
                <FaCaretDown />
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
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
          <div
            className="guest-menu"
            onClick={toggleHamburger}
            ref={hamburgerRef}
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {isHamburgerOpen && (
              <div className="dropdown-menu">
                {user && (
                  <Link to="/my-vehicles" className="dropdown-link">
                    My Vehicles
                  </Link>
                )}
                {user && (
                  <Link to="/liked-vehicles" className="dropdown-link">
                    Liked Vehicles
                  </Link>
                )}
                {user && (
                  <Link to="/settings" className="dropdown-link">
                    Settings
                  </Link>
                )}
                {!user && (
                  <Link to="/login" className="dropdown-link">
                    Login
                  </Link>
                )}
                <div className="dropdown-link" onClick={handleSellClick}>
                  Sell
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay">
          <form
            onSubmit={(e) => {
              handleSearch(e);
              // setIsMobileSearchOpen(false);
            }}
            className="mobile-search-form"
          >
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="mobile-search-btn">
              <FiSearch />
            </button>
            <button
              type="button"
              className="mobile-search-close"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              ✕
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;
