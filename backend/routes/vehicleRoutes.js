const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const pendingVehicleController = require("../controllers/pendingVehicleController");
const likeController = require("../controllers/likeController");
const likeRouter = require("../routes/likeRoutes");
const authController = require("../controllers/authController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); //add error for file size more than 5mb
// const upload = multer({ dest: "uploads/" });

const router = express.Router();

//routes for likes(like POST /vehicles/:vehicleId/likes for liking a vehicle):
router.use("/:vehicleId/likes", likeRouter);

// router.post(
//   "/list",
//   upload.array("images", 20), //add an error for more than 20
//   authController.protect,
//   pendingVehicleController.listVehicle
// );

//edit vehicle
router.patch(
  "/:vehicleId", // Use PATCH method and add :id param to specify which vehicle to update
  authController.protect, // Ensure the user is authenticated
  vehicleController.updateVehicle // The update vehicle controller function you created
);

//edit vehicle
router.patch(
  "/:vehicleId/sold",
  authController.protect,
  vehicleController.markVehicleAsSold
);

//search
router.get("/search", vehicleController.searchVehicles);

router.get("/random", vehicleController.getRandomVehicles);

router.get("/featured", vehicleController.getFeaturedVehicles);

router
  .route("/:vehicleId")
  .get(vehicleController.getVehicle)
  .delete(authController.protect, vehicleController.deleteVehicle);

router.patch(
  "/:vehicleId/feature",
  authController.protect,
  authController.restrictTo("admin"),
  vehicleController.markAsFeatured
);

router.patch(
  "/:vehicleId/unfeature",
  authController.protect,
  authController.restrictTo("admin"),
  vehicleController.unmarkAsFeatured
);

module.exports = router;
