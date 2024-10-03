const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    default: "Male",
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  review: {
    rating: {
      type: Number,
    },
    comment: {
      type: String,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  socialMediaLinks: [
    {
      type: String,
    },
  ],
  backgroundCheck: {
    criminalBackground: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
  },
  role: {
    type: String,
    default: "service-provider",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  approvalStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  serviceType: {
    type: String,
  },
  serviceHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0],
    },
  },
  uploadedDocuments: [
    {
      path: String,
    },
  ],
  uploadedImages: [
    {
      path: String,
    },
  ],
  settings: {
    notificationEnabled: Boolean,
    locationEnabled: Boolean,
  },

  Reference: {
    fullName: {
      type: String,
    },
    phone: {
      type: String,
    },
    relationship: {
      type: String,
    },
    address: {
      type: String,
      default: "Addis Ababa",
    },
    insurance: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
  },
  description: {
    type: String,
    required: false,
  },
  profile: {
    type: String,
    default: "image-1632717633130.png",
  },
  conversations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  ],
});

serviceProviderSchema.index({ location: "2dsphere" });

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

module.exports = ServiceProvider;
