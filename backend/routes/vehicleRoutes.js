const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const pendingVehicleController = require("../controllers/pendingVehicleController");
const authController = require("../controllers/authController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage }); // Accept up to 20 images
// const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post(
  "/list",
  upload.array("images"),
  authController.protect,
  pendingVehicleController.listVehicle
);

//edit vehicle
router.patch(
  "/update/:id", // Use PATCH method and add :id param to specify which vehicle to update
  authController.protect, // Ensure the user is authenticated
  vehicleController.updateVehicle // The update vehicle controller function you created
);

//search
router.get("/search", vehicleController.searchVehicles);

router.get("/random-vehicles", vehicleController.getRandomVehicles);

router
  .route("/:vehicleId")
  .get(vehicleController.getVehicle)
  .delete(authController.protect, vehicleController.deleteVehicle);

module.exports = router;
