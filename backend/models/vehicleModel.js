const mongoose = require("mongoose");

const vehicleSchema = mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, "Please enter the brand of your vehicle"],
    },
    model: {
      type: String,
      required: [true, "Please enter the model of your vehicle"],
    },
    variant: {
      type: String,
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
        values: ["petrol", "diesel", "electric", "hybrid", "CNG", "LPG"],
        message: "{VALUE} is not a valid fuel type",
      },
      required: [true, "Please specify the fuel type of your vehicle"],
    },
    transmission: {
      type: String,
      enum: {
        values: ["manual", "automatic"],
        message:
          "{VALUE} is not a valid transmission type. Choose from manual, automatic",
      },
      required: [true, "Please specify the transmission type of your vehicle"],
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
          "I3",
          "I4",
          "I5",
          "I6",
          "V6",
          "V8",
          "V10",
          "V12",
          "V16",
          "W12",
          "w16",
          "H4", //boxer 4
          "H6", //boxer 6
          "rotary",
        ],
        message: "{VALUE} is not a valid engine type",
      },
      // required: [true, "Please specify the engine type of your vehicle"],
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
    location: {
      type: String,
      required: [true, "Please enter the location of your vehicle"],
    },
    listedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "please provide user"],
    },
    image: {
      type: String, // Store the URL of the image
      // required: [true, "Please upload an image of your vehicle"],
    },
    images: {
      type: [String], // Store the URLs of the images
      // required: [true, "Please upload an image of your vehicle"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description for your vehicle"],
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;
