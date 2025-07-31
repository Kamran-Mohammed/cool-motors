const catchAsyncError = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const PendingVehicle = require("../models/pendingVehicleModel");
const Vehicle = require("../models/vehicleModel");
const User = require("../models/userModel");
const Email = require("../utils/email");
const crypto = require("crypto");
const { deleteS3Images } = require("../utils/tools");
const sharp = require("sharp");

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

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

exports.listVehicle = catchAsyncError(async (req, res, next) => {
  //check if the user is listing more number of vehicles than the limit.
  const user = await User.findById(req.user._id);
  if (
    user.role !== "admin" &&
    user.totalVehicles >= process.env.MAX_VEHICLES_NUM
  ) {
    return next(
      new AppError(
        `You can't list more than ${process.env.MAX_VEHICLES_NUM} vehicle at a time.`
      )
    );
  }

  const files = req.files; // Handling multiple files

  // Check if there are files to upload
  if (!files || files.length === 0) {
    return next(new AppError("No images provided", 422));
  }

  const imageUrls = [];

  // Loop through the files and upload each one to S3
  for (const file of files) {
    const fileName = generateFileName();

    // Compress and convert image to JPEG
    const resizedBuffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1200 }) // resize to 1200px width (optional)
      .jpeg({ quality: 80 }) // compress to 80% quality
      .toBuffer();

    const uploadParams = {
      Bucket: bucketName,
      Body: resizedBuffer,
      Key: fileName,
      ContentType: "image/jpeg", // Always JPEG after compression
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

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
    state: req.body.state,
    location: req.body.location,
    listedBy: req.user._id,
    images: imageUrls, // Storing the array of image URLs
  });

  user.totalVehicles += 1;
  await user.save({ validateBeforeSave: false });

  //SENDING EMAIL NOTIFICATION TO ADMINS

  //uncomment the following lines (after solving the email gicchi)
  // (async () => {
  //   try {
  //     const admins = await User.find({ role: "admin" });
  //     if (admins.length === 0) {
  //       console.warn("Admins not found. Skipping admin email notification.");
  //       return;
  //     }

  //     let url = "";
  //     if (process.env.NODE_ENV === "development") {
  //       url = `${process.env.FRONTEND_URL_DEV}/admin/pending-vehicle/${newVehicle._id}`;
  //     } else {
  //       url = `${process.env.FRONTEND_URL_PROD}/admin/pending-vehicle/${newVehicle._id}`;
  //     }

  //     for (const admin of admins) {
  //       await new Email(admin, url).sendAdminNotificationEmail();
  //     }
  //   } catch (err) {
  //     console.error("Failed to send email to admin:", err.message);
  //     // No return or throw — just log and move on
  //   }
  // })();

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
    createdAt: undefined,
    updatedAt: undefined,
  });

  // Add the vehicle to the owner's User document
  await User.findByIdAndUpdate(pendingVehicle.listedBy, {
    $push: { listedVehicles: approvedVehicle._id },
  });

  // Remove the vehicle from the `pendingVehicles` collection
  await PendingVehicle.findByIdAndDelete(id, { skipImageDeletion: true });

  try {
    // SEND APPROVED EMAIL TO USER
    const user = await User.findById(pendingVehicle.listedBy);
    let url = "";
    if (process.env.NODE_ENV === "development") {
      url = `${process.env.FRONTEND_URL_DEV}/vehicle/${approvedVehicle._id}`;
    } else {
      url = `${process.env.FRONTEND_URL_PROD}/vehicle/${approvedVehicle._id}`;
    }
    await new Email(user, url).sendApprovalEmail();
  } catch (err) {
    return next(
      new AppError(
        "There was an error sending the email. Please try again later",
        500
      )
    );
  }

  res.status(201).json({
    status: "success",
    data: {
      approvedVehicle,
    },
  });
});

exports.disapproveVehicle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const pendingVehicle = await PendingVehicle.findById(id);

  if (!pendingVehicle) {
    return next(new AppError("Vehicle not found in pending list.", 404));
  }

  // Find and remove the pending vehicle by ID(images deleting in query middleware)
  await PendingVehicle.findByIdAndDelete(id);

  const user = await User.findByIdAndUpdate(
    pendingVehicle.listedBy,
    {
      $inc: { totalVehicles: -1 },
    },
    { new: true }
  );

  try {
    // SEND DISAPPROVED EMAIL TO USER
    let url = "";
    if (process.env.NODE_ENV === "development") {
      url = `${process.env.FRONTEND_URL_DEV}/list`;
    } else {
      url = `${process.env.FRONTEND_URL_PROD}/list`;
    }

    await new Email(user, url).sendDisapprovalEmail();
  } catch (err) {
    return next(
      new AppError(
        "There was an error sending the email. Please try again later",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Vehicle disapproved and removed from pending list.",
  });
});

exports.getRandomVehicle = catchAsyncError(async (req, res, next) => {
  const vehicle = await PendingVehicle.aggregate([{ $sample: { size: 1 } }]); // Get one random vehicle

  res.status(200).json({
    status: "success",
    data: {
      vehicle: vehicle[0], // Return the single vehicle
    },
  });
});

exports.getOldestPendingVehicle = catchAsyncError(async (req, res, next) => {
  const vehicle = await PendingVehicle.findOne().sort({ createdAt: 1 }); // Get the oldest added vehicle

  res.status(200).json({
    status: "success",
    data: {
      vehicle, // Return the oldest vehicle
    },
  });
});

exports.getPendingVehicles = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 per page
  const skip = (page - 1) * limit;

  const total = await PendingVehicle.countDocuments();
  const vehicles = await PendingVehicle.find()
    .sort({ createdAt: 1 }) // Oldest first
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: vehicles.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: { vehicles },
  });
});

exports.getPendingVehicle = catchAsyncError(async (req, res, next) => {
  const vehicleId = req.params.id;

  const vehicle = await PendingVehicle.findById(vehicleId);

  if (!vehicle) {
    return next(new AppError("No pending-vehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});

exports.getNextPendingVehicle = catchAsyncError(async (req, res, next) => {
  const vehicleId = req.params.id;

  // Fetch the current vehicle
  const currentVehicle = await PendingVehicle.findById(vehicleId);
  if (!currentVehicle) {
    return next(new AppError("No pending vehicle found with that ID", 404));
  }

  // Fetch the next vehicle that was created after the current one
  const nextVehicle = await PendingVehicle.findOne({
    createdAt: { $gt: currentVehicle.createdAt }, // Get the next vehicle based on createdAt timestamp
  }).sort({ createdAt: 1 }); // Sort in ascending order to get the earliest next one

  if (!nextVehicle) {
    return next(new AppError("No next pending-vehicle found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      nextVehicle,
    },
  });
});
