const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const PendingVehicle = require("../models/pendingVehicleModel");
const Vehicle = require("../models/vehicleModel");
const User = require("../models/userModel");

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");

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
  const newVehicle = await PendingVehicle.create({
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

  //   // Add the vehicle to the owner's User document
  //   await User.findByIdAndUpdate(req.user._id, {
  //     $push: { listedVehicles: newVehicle._id },
  //   });

  res.status(201).json({
    status: "success",
    data: {
      newVehicle,
    },
  });
});

exports.approveVehicle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the pending vehicle by ID
  const pendingVehicle = await PendingVehicle.findById(id);
  if (!pendingVehicle) {
    return next(new AppError("Vehicle not found in pending list.", 404));
  }

  // Create a new vehicle in the `vehicles` collection
  const approvedVehicle = await Vehicle.create({
    ...pendingVehicle.toObject(), // Copy all fields
    _id: undefined, // Exclude _id to allow MongoDB to generate a new ID
  });

  // Add the vehicle to the owner's User document
  await User.findByIdAndUpdate(pendingVehicle.listedBy, {
    $push: { listedVehicles: approvedVehicle._id },
  });

  // Remove the vehicle from the `pendingVehicles` collection
  await PendingVehicle.findByIdAndDelete(id);

  //SEND APPROVED EMAIL TO USER

  res.status(201).json({
    status: "success",
    data: {
      approvedVehicle,
    },
  });
});

exports.disapproveVehicle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find and remove the pending vehicle by ID
  const pendingVehicle = await PendingVehicle.findByIdAndDelete(id);
  if (!pendingVehicle) {
    return next(new AppError("Vehicle not found in pending list.", 404));
  }

  //SEND DISAPPROVED EMAIL TO USER

  res.status(200).json({
    status: "success",
    message: "Vehicle disapproved and removed from pending list.",
  });
});

exports.getRandomVehicle = catchAsyncError(async (req, res, next) => {
  const vehicle = await PendingVehicle.aggregate([{ $sample: { size: 1 } }]); // Get one random vehicle

  // if (!vehicle || vehicle.length === 0) {
  //   return res.status(404).json({
  //     status: "fail",
  //     message: "No vehicles found",
  //   });
  // }

  res.status(200).json({
    status: "success",
    data: {
      vehicle: vehicle[0], // Return the single vehicle
    },
  });
});