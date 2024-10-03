// notificationModel.js

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  ///???type?
  type: {
    type: String,
    enum: ["System", "Custom"],
    default: "Custom",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const AdminNotification = mongoose.model(
  "AdminNotification",
  notificationSchema
);

module.exports = AdminNotification;
