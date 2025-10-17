import "./css/Navbar.css";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import userIcon from "./images/user.png";
import AFLogoSBS from "./images/af_logo_sbs_blue.png";
import { FiSearch, FiPlus } from "react-icons/fi";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { parseSearchQuery } from "../utils/searchUtils";
import {
  locations,
  states,
  carMakes,
  carModels,
  fuelTypes,
  transmissions,
  engineTypes,
} from "./data.js";

const Navbar = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

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
      if (hamburgerRef.current && !hamburgerRef.current.contains(event.target))
        setIsHamburgerOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setIsSuggestionsVisible(false); // 👇 NEW
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

  const handleSearch = (e, query) => {
    e.preventDefault();
    const rawInput = query || searchQuery.trim();
    if (rawInput) {
      console.log(rawInput);

      let parsedFilters = {};
      if (query) {
        const filterLists = [
          { key: "make", list: carMakes },
          { key: "model", list: carModels },
          { key: "fuelType", list: fuelTypes },
          { key: "transmission", list: transmissions },
          { key: "engineType", list: engineTypes },
          { key: "location", list: locations },
          { key: "state", list: states },
        ];

        // Try to match query exactly in any of the filter lists
        let matched = false;
        for (const { key, list } of filterLists) {
          const exactMatch = list.find(
            (item) => item.toLowerCase() === query.toLowerCase()
          );
          if (exactMatch) {
            parsedFilters[key] = exactMatch;
            matched = true;
            break; // stop at first match
          }
        }

        // fallback to normal parsing if no exact match found
        if (!matched) {
          parsedFilters = parseSearchQuery(rawInput);
        }
      } else {
        parsedFilters = parseSearchQuery(rawInput);
      }
      parsedFilters.sort = "DateNto";
      // Navigate with the clean, structured parameters
      const queryParams = new URLSearchParams(parsedFilters);
      navigate(`/search?${queryParams.toString()}`);
    } else {
      // If the input is empty, navigate to the base search page
      navigate("/search");
    }
    setIsHamburgerOpen(false);
    setIsDropdownOpen(false);
    setIsSuggestionsVisible(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus(); // 👈 re-focus the input
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
      return;
    }

    const lowerValue = value.toLowerCase();

    const allItems = [
      ...carMakes,
      ...carModels,
      ...locations,
      ...states,
      ...fuelTypes,
      ...transmissions,
      ...engineTypes,
    ];

    const matched = allItems
      .filter((item) => item.toLowerCase().includes(lowerValue))
      .slice(0, 10); // limit to 10 suggestions

    setSuggestions(matched);
    setIsSuggestionsVisible(true);
    setHighlightedIndex(-1);
  };
  const handleKeyDown = (e) => {
    if (!isSuggestionsVisible || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex =
        highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0;
      setHighlightedIndex(nextIndex);
      setSearchQuery(suggestions[nextIndex]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex =
        highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1;
      setHighlightedIndex(prevIndex);
      setSearchQuery(suggestions[prevIndex]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected =
        highlightedIndex >= 0 ? suggestions[highlightedIndex] : searchQuery;
      handleSearch(e, selected);
      setIsSuggestionsVisible(false);
      setHighlightedIndex(-1); // reset highlight
    }
  };

  const handleSuggestionClick = (e, suggestion) => {
    e.preventDefault();
    setSearchQuery(suggestion);
    setIsSuggestionsVisible(false);
    inputRef.current?.focus();
    handleSearch(e, suggestion);
  };

  const renderSuggestions = () =>
    isSuggestionsVisible &&
    suggestions.length > 0 && (
      <ul className="search-suggestions">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className={`suggestion-item ${
              index === highlightedIndex ? "highlighted" : ""
            }`}
            onMouseEnter={() => setHighlightedIndex(index)}
            // onClick={() => handleSuggestionClick(suggestion)}
            onMouseDown={(e) => {
              e.preventDefault(); // prevents losing focus
              handleSuggestionClick(e, suggestion);
            }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <header className="header">
        <div className="nav-left">
          <Link to="/" className="home-link">
            <img src={AFLogoSBS} className="logo-large" alt="Logo Large" />
            {/* <img src={AFSmall} className="logo-small" alt="Logo Small" /> */}
          </Link>
        </div>

        <div className="nav-search-wrapper" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form-container">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search Vehicles..."
              value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-btn"
                // onClick={() => setSearchQuery("")}
                onClick={handleClear}
              >
                ×
              </button>
            )}
            <button type="submit" className="search-submit-btn">
              <FiSearch className="search-icon" />
            </button>
          </form>
          {renderSuggestions()}
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
            onSubmit={(e) => handleSearch(e)}
            className="mobile-search-form"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              type="button"
              className="clear-btn"
              // onClick={() => setSearchQuery("")}
              onClick={handleClear}
            >
              ×
            </button>
            <button type="submit" className="mobile-search-btn">
              <FiSearch />
            </button>
          </form>
          {renderSuggestions()}
          <button
            type="button"
            className="mobile-search-close"
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <FaCaretUp />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
