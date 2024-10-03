const express = require("express");
const router = express.Router();
const authController = require("../controllers/adminAuthController");
const authorize = require("../middlewares/adminAuthorization");

// Route to send all admin detail
router.get("/all", authorize("super-admin"), authController.getallAdmins);

// Route to register a new admin
router.post("/register", authController.registerAdmin);

// Route to log in an admin
router.post(
  "/login",
  authController.validateAdminLogin,
  authController.loginAdmin
);

// Route to send email verification for password reset
router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.verifyPasswordReset);

router.delete("/remove", authorize("super-admin"), authController.removeAdmin);

router.put("/changeRole", authorize("super-admin"), authController.changeRole);
module.exports = router;
