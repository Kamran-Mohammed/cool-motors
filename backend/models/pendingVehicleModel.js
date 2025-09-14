const mongoose = require("mongoose");
const User = require("../models/userModel");
const { states } = require("../utils/data");
const { deleteS3Images } = require("../utils/tools");

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

// Utility function for trimming + capitalizing first letter
function formatString(val) {
  if (typeof val !== "string") return val;
  val = val.trim();
  if (val.length === 0) return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

const pendingVehicleSchema = mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, "Please enter the brand of your vehicle"],
      set: formatString,
    },
    model: {
      type: String,
      required: [true, "Please enter the model of your vehicle"],
      set: formatString,
    },
    variant: {
      type: String,
      set: formatString,
    },
    year: {
      type: Number,
      required: [true, "Please enter the year of your vehicle"],
      min: [1900, "Year must be between 1900 and the current year"],
      max: [
        new Date().getFullYear(),
        "Year must be between 1900 and the current year",
      ],
    },
    price: {
      type: Number,
      required: [true, "Please enter the price for your vehicle"],
      min: [0, "Price must be positive"],
    },
    fuelType: {
      type: String,
      enum: {
        values: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"],
        message: "{VALUE} is not a valid fuel type",
      },
      required: [true, "Please specify the fuel type of your vehicle"],
      set: formatString,
    },
    transmission: {
      type: String,
      enum: {
        values: ["Manual", "Automatic"],
        message:
          "{VALUE} is not a valid transmission type. Choose from manual, automatic",
      },
      required: [true, "Please specify the transmission type of your vehicle"],
      set: formatString,
    },
    engineDisplacement: {
      type: Number,
      // required: [true, "Please specify the engine displacement of your vehicle"],
      min: [0, "Engine displacement must be a positive number"],
      max: [10, "Engine displacement cannot exceed 10.0 liters"],
      validate: {
        validator: function (value) {
          return value.toFixed(1) == value;
        },
        message: "Engine displacement can only have up to one decimal place",
      },
    },
    engineType: {
      type: String,
      enum: {
        values: [
          "Inline 3",
          "Inline 4",
          "Inline 5",
          "Inline 6",
          "V6",
          "V8",
          "V10",
          "V12",
          "V16",
          "W12",
          "W16",
          "Flat 4", //boxer 4
          "Flat 6", //boxer 6
          "rotary",
        ],
        message: "{VALUE} is not a valid engine type",
      },
      // required: [true, "Please specify the engine type of your vehicle"],
      set: formatString,
    },
    odometer: {
      type: Number,
      required: [true, "Please enter the km driven by your vehicle"],
      min: [0, "Odometer reading must be positive"],
    },
    ownership: {
      type: Number,
      required: [true, "Please enter the ownership of your vehicle"],
      min: [1, "Ownership number must be at least 1"],
    },
    state: {
      type: String,
      enum: { values: states, message: "{VALUE} is not a valid state" },
      required: [true, "Please enter the state(location) of your vehicle"],
      set: formatString,
    },
    location: {
      type: String,
      required: [true, "Please enter the location of your vehicle"],
      set: formatString,
    },
    listedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "please provide user"],
    },
    images: {
      type: [String], // Store the URLs of the images
      // required: [true, "Please upload an image of your vehicle"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description for your vehicle"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      set: formatString,
    },
    // tag: {
    //   type: [String],
    //   enum: {
    //     values: [
    //       "clean",
    //       "classic",
    //       "vintage",
    //       "exotic",
    //       "luxury",
    //       "rare",
    //       "modified",
    //     ],
    //     message: "{VALUE} is not a valid tag.",
    //   },
    // },
    // expiresAt: {
    //   type: Date,
    //   default: () => Date.now() + 30 * 24 * 60 * 60 * 1000, // Correct way to set dynamic default
    //   // default: () => Date.now() + 60 * 1000,
    //   immutable: true, // Prevents direct updates
    // },
  },
  {
    timestamps: true,
  }
);

// Middleware for deleting images from S3 and updating references
pendingVehicleSchema.post("findOneAndDelete", async function (vehicle) {
  if (!vehicle) return;

  // Check if image deletion should be skipped
  if (this.options.skipImageDeletion) {
    return;
  }

  deleteS3Images(vehicle.images);
});

// pendingVehicleSchema.post("findOneAndDelete", async function (vehicle) {
//   if (!vehicle) return;

//   await User.findByIdAndUpdate(vehicle.listedBy, {
//     $inc: { totalVehicles: -1 },
//   });
// });

const PendingVehicle = mongoose.model("PendingVehicle", pendingVehicleSchema);

module.exports = PendingVehicle;
