// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Import the HomePage component
import UserProfile from "./pages/UserProfile";
import MyVehicles from "./pages/MyVehicles";
import LikedVehicles from "./pages/LikedVehicles";
import ListVehicle from "./pages/ListVehicle";
import VehicleDetails from "./pages/VehicleDetails";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Navbar from "./utils/Navbar"; // Import the Navbar
import SearchVehiclesPage from "./pages/SearchVehiclesPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import ReviewVehicles from "./pages/ReviewVehicles";
import EditVehicle from "./pages/EditVehicle";
import UpdateMe from "./pages/UpdateMe";
// import Restricted from "./pages/Restricted";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyEmailUpdate from "./pages/VerifyEmailUpdate";
import UpdateMyEmail from "./pages/UpdateMyEmail";
import SoldVehicleDetails from "./pages/SoldVehicleDetails";
import Footer from "./utils/Footer";
import PendingVehiclesList from "./pages/PendingVehiclesList";
import PendingVehicle from "./pages/PendingVehicle";
import NoMorePendingVehicles from "./pages/NoMorePendingVehicles";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Navbar will be rendered on all pages */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/my-vehicles" element={<MyVehicles />} />
            <Route path="/liked-vehicles" element={<LikedVehicles />} />
            <Route path="/list" element={<ListVehicle />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/vehicle/:id/:slug" element={<VehicleDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<SearchVehiclesPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password/:resetToken"
              element={<ResetPassword />}
            />
            <Route
              path="/verify-email/:verificationToken"
              element={<VerifyEmail />}
            />
            <Route path="/update-my-email" element={<UpdateMyEmail />} />
            <Route
              path="/verify-email-update/:verificationToken"
              element={<VerifyEmailUpdate />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/update-password" element={<ChangePassword />} />
            <Route path="/admin/review-vehicles" element={<ReviewVehicles />} />
            <Route
              path="/admin/pending-vehicles-list"
              element={<PendingVehiclesList />}
            />
            <Route
              path="/admin/pending-vehicle/:id"
              element={<PendingVehicle />}
            />
            <Route
              path="/admin/no-pending-vehicles"
              element={<NoMorePendingVehicles />}
            />
            <Route path="/edit/:vehicleId" element={<EditVehicle />} />
            <Route path="/update-me" element={<UpdateMe />} />
            {/* <Route path="/restricted" element={<Restricted />} /> */}
            <Route path="/sold-vehicle/:id" element={<SoldVehicleDetails />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
