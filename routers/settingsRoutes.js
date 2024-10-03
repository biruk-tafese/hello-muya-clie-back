const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/adminAuthorization");
const settingsController = require("../controllers/settingsController");

// Route GET Settings
router.get("/", authorize("super-admin"), settingsController.getSettings);

// Route POST  Update Email Configuration
router.post(
  "/update",
  authorize("super-admin"),
  settingsController.updateSettings
);

// Route GET Set Default Settings
router.get(
  "/default",
  authorize("super-admin"),
  settingsController.defaultSettings
);

module.exports = router;
