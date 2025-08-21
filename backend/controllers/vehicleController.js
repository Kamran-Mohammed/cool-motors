const Vehicle = require("../models/vehicleModel");
const SoldVehicle = require("../models/soldVehicleModel");
const User = require("../models/userModel");
const Like = require("../models/likeModel");
const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const factory = require("./handlerFactory");

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

exports.listVehicle = catchAsyncError(async (req, res, next) => {
  const files = req.files; // Handling multiple files

  // Check if there are files to upload
  if (!files || files.length === 0) {
    return next(new AppError("No images provided", 422));
  }

  const imageUrls = [];

  // Loop through the files and upload each one to S3
  for (const file of files) {
    const fileName = generateFileName();
    const uploadParams = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: fileName,
      ContentType: file.mimetype,
    };

    // Send the upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Push the uploaded image URL to the array
    const imageUrl = `https://images-cool-motors.s3.eu-north-1.amazonaws.com/${fileName}`;
    imageUrls.push(imageUrl);
  }

  // Create the vehicle with the uploaded image URLs
  const newVehicle = await Vehicle.create({
    make: req.body.make,
    model: req.body.model,
    variant: req.body.variant,
    year: req.body.year,
    price: req.body.price,
    fuelType: req.body.fuelType,
    transmission: req.body.transmission,
    engineDisplacement: req.body.engineDisplacement || undefined,
    engineType: req.body.engineType || undefined,
    odometer: req.body.odometer,
    ownership: req.body.ownership,
    description: req.body.description,
    location: req.body.location,
    listedBy: req.user._id,
    images: imageUrls, // Storing the array of image URLs
  });

  // Add the vehicle to the owner's User document
  await User.findByIdAndUpdate(req.user._id, {
    $push: { listedVehicles: newVehicle._id },
  });

  res.status(201).json({
    status: "success",
    data: {
      newVehicle,
    },
  });
});

exports.updateVehicle = catchAsyncError(async (req, res, next) => {
  const vehicleId = req.params.vehicleId;

  // Find the existing vehicle by ID
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new AppError("Vehicle not found", 404));
  }

  // Check if the logged-in user is the one who listed the vehicle
  if (vehicle.listedBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You are not authorized to update this vehicle", 401)
    );
  }

  // Update the vehicle with the provided fields
  const updatedVehicleData = {
    make: req.body.make || vehicle.make,
    model: req.body.model || vehicle.model,
    variant: req.body.variant || vehicle.variant,
    year: req.body.year || vehicle.year,
    price: req.body.price || vehicle.price,
    fuelType: req.body.fuelType || vehicle.fuelType,
    transmission: req.body.transmission || vehicle.transmission,
    engineDisplacement:
      req.body.engineDisplacement || vehicle.engineDisplacement,
    engineType: req.body.engineType || vehicle.engineType,
    odometer: req.body.odometer || vehicle.odometer,
    ownership: req.body.ownership || vehicle.ownership,
    description: req.body.description || vehicle.description,
    location: req.body.location || vehicle.location,
    state: req.body.state || vehicle.state,
  };

  // Update the vehicle in the database
  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    updatedVehicleData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedVehicle,
    },
  });
});

exports.getVehicle = catchAsyncError(async (req, res, next) => {
  // console.log("get");

  const vehicleId = req.params.vehicleId;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    return next(new AppError("No vehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});

// exports.getVehicle = factory.getOne(Vehicle);

exports.getVehiclesOfUser = catchAsyncError(async (req, res, next) => {
  const userId = req.params.userId;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  const vehicles = await Vehicle.find({ listedBy: userId });

  res.status(200).json({
    status: "success",
    results: vehicles.length,
    data: {
      vehicles,
    },
  });
});

// exports.getLikedVehiclesOfUser = catchAsyncError(async (req, res, next) => {
//   const userId = req.params.userId;

//   // Check if user exists
//   const user = await User.findById(userId);
//   if (!user) {
//     return next(new AppError("No user found with that ID", 404));
//   }

//   // Fetch the vehicles liked by the user
//   const likedVehicles = await Vehicle.find({
//     _id: { $in: user.likedVehicles },
//   });

//   res.status(200).json({
//     status: "success",
//     results: likedVehicles.length,
//     data: {
//       likedVehicles,
//     },
//   });
// });

exports.searchVehicles = catchAsyncError(async (req, res) => {
  const filters = {
    make: req.query.make ? req.query.make.split(",") : undefined,
    model: req.query.model ? req.query.model.split(",") : undefined,
    minYear: req.query.minYear,
    maxYear: req.query.maxYear,
    fuelType: req.query.fuelType ? req.query.fuelType.split(",") : undefined,
    transmission: req.query.transmission
      ? req.query.transmission.split(",")
      : undefined,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    minOdometer: req.query.minOdometer,
    maxOdometer: req.query.maxOdometer,
    engineType: req.query.engineType
      ? req.query.engineType.split(",")
      : undefined,
    state: req.query.state ? req.query.state.split(",") : undefined,
    location: req.query.location ? req.query.location.split(",") : undefined,
    sort: req.query.sort, // Sort query parameter
  };

  const searchCriteria = {};

  if (filters.make)
    searchCriteria.make = {
      $in: filters.make.map((make) => new RegExp(make, "i")),
    };
  if (filters.model)
    searchCriteria.model = {
      $in: filters.model.map((model) => new RegExp(model, "i")),
    };
  if (filters.minYear || filters.maxYear) {
    searchCriteria.year = {};
    if (filters.minYear) searchCriteria.year.$gte = filters.minYear;
    if (filters.maxYear) searchCriteria.year.$lte = filters.maxYear;
  }
  if (filters.fuelType)
    searchCriteria.fuelType = {
      $in: filters.fuelType.map((fuelType) => new RegExp(fuelType, "i")),
    };
  if (filters.transmission)
    searchCriteria.transmission = {
      $in: filters.transmission.map(
        (transmission) => new RegExp(transmission, "i")
      ),
    };
  if (filters.minPrice || filters.maxPrice) {
    searchCriteria.price = {};
    if (filters.minPrice) searchCriteria.price.$gte = filters.minPrice;
    if (filters.maxPrice) searchCriteria.price.$lte = filters.maxPrice;
  }
  if (filters.minOdometer || filters.maxOdometer) {
    searchCriteria.odometer = {};
    if (filters.minOdometer) searchCriteria.odometer.$gte = filters.minOdometer;
    if (filters.maxOdometer) searchCriteria.odometer.$lte = filters.maxOdometer;
  }
  if (filters.engineType)
    searchCriteria.engineType = {
      $in: filters.engineType.map((engineType) => new RegExp(engineType, "i")),
    };
  if (filters.state)
    searchCriteria.state = {
      $in: filters.state.map((state) => new RegExp(state, "i")),
    };
  if (filters.location)
    searchCriteria.location = {
      $in: filters.location.map((location) => new RegExp(location, "i")),
    };

  // Sorting logic
  let sortBy = {};
  if (filters.sort === "priceAsc") sortBy.price = 1;
  if (filters.sort === "priceDesc") sortBy.price = -1;
  if (filters.sort === "odometerAsc") sortBy.odometer = 1;
  if (filters.sort === "odometerDesc") sortBy.odometer = -1;
  if (filters.sort === "DateNto") sortBy.createdAt = -1;
  if (filters.sort === "dateOtn") sortBy.createdAt = 1; 

  // const vehicles = await Vehicle.find(searchCriteria).sort(sortBy).explian();
  // const vehicles = await Vehicle.find(searchCriteria).sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 28; // Default limit of 10 per page
  const skip = (page - 1) * limit;

  // Fetch paginated results
  const totalVehicles = await Vehicle.countDocuments(searchCriteria); // Get total count
  const vehicles = await Vehicle.find(searchCriteria)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  // res.status(200).json({
  //   status: "success",
  //   results: vehicles.length,
  //   data: {
  //     vehicles,
  //   },
  // });
  res.status(200).json({
    status: "success",
    currentPage: page,
    totalPages: Math.ceil(totalVehicles / limit),
    totalResults: totalVehicles,
    results: vehicles.length,
    data: {
      vehicles,
    },
  });
});

exports.deleteVehicle = catchAsyncError(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.vehicleId);

  if (!vehicle) {
    return next(new AppError("No vehicle found with that ID", 404));
  }

  if (String(req.user._id) !== String(vehicle.listedBy)) {
    return next(
      new AppError("You don't have permission to delete this vehicle", 403)
    );
  }

  // //delete likes of this vehicle
  // const likes = await Like.find({ vehicle: req.params.vehicleId });
  // for (const like of likes) {
  //   await Like.findByIdAndDelete(like._id);
  // }

  // Delete the vehicle
  await Vehicle.findByIdAndDelete(req.params.vehicleId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// exports.likeVehicle = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const vehicleId = req.params.vehicleId;

//   // Check if vehicle exists
//   const vehicle = await Vehicle.findById(vehicleId);
//   if (!vehicle) {
//     return next(new AppError("No vehicle found with that ID", 404));
//   }

//   // Add vehicle to likedVehicles array
//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $addToSet: { likedVehicles: vehicleId } }, // $addToSet ensures no duplicates
//     { new: true, runValidators: true } // Return the updated document and run validators
//   );

//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser,
//     },
//   });
// });

// exports.unlikeVehicle = catchAsyncError(async (req, res, next) => {
//   const userId = req.user._id;
//   const vehicleId = req.params.vehicleId;

//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $pull: { likedVehicles: vehicleId } },
//     { new: true, runValidators: true }
//   );

//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser,
//     },
//   });
// });

// exports.getLikedVehicles = catchAsyncError(async (req, res, next) => {
//   console.log("khbgih");

//   const userId = req.user._id;

//   // Fetch user and populate likedVehicles
//   const user = await User.findById(userId).populate("likedVehicles");

//   res.status(200).json({
//     status: "success",
//     results: user.likedVehicles.length,
//     data: {
//       likedVehicles: user.likedVehicles,
//     },
//   });
// });

exports.getRandomVehicles = catchAsyncError(async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10; // Number of random vehicles to return, default to 10

  const vehicles = await Vehicle.aggregate([{ $sample: { size: limit } }]);

  res.status(200).json({
    status: "success",
    results: vehicles.length,
    data: {
      vehicles,
    },
  });
});

exports.markVehicleAsSold = catchAsyncError(async (req, res, next) => {
  const { vehicleId } = req.params;

  // Find the vehicle by ID
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new AppError("Vehicle not found.", 404));
  }

  if (String(req.user._id) !== String(vehicle.listedBy)) {
    return next(
      new AppError("You don't have permission mark this vehicle as sold.", 403)
    );
  }

  // Create a new document in the `SoldVehicle` collection
  const soldVehicle = await SoldVehicle.create({
    ...vehicle.toObject(), // Copy all fields
    _id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  // Remove the vehicle from the `Vehicle` collection without deleting images
  await Vehicle.findByIdAndDelete(vehicleId, { skipImageDeletion: true });

  // try {
  //   // SEND SOLD CONFIRMATION EMAIL TO SELLER
  //   const user = await User.findById(vehicle.listedBy);
  //   await new Email(user, soldVehicle).sendSoldConfirmation();
  // } catch (err) {
  //   return next(
  //     new AppError("Error sending email. Please try again later.", 500)
  //   );
  // }

  res.status(200).json({
    status: "success",
    data: {
      soldVehicle,
    },
  });
});
