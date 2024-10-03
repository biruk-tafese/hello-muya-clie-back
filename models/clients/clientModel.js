const mongoose = require("mongoose");
const userSchema = require("../users/userModel");

const clientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: false,
    unique: false,
  },

  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verification: { type: Boolean, default: false },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    default: "client",
  },
  serviceType: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  locationDescription: {
    type: String,
  },
  services: {
    type: [String],
  },

  distance: {
    type: String,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  profile: {
    type: String,
    default: "image-1632717633130.png",
  },
  profession: { type: String, required: false },
  otp: { type: String, required: false, default: "none" },
  otpExpiration: { type: String, required: false, default: "none" },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
