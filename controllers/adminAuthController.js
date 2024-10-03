const Admin = require("../models/admin/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");

exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, password, email } = req.body;

    const existingAdmin = await Admin.findOne({
      $or: [{ fullName }, { email }],
    });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this fullName or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      fullName,
      password: hashedPassword,
      email,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Validation Error:", error.message);
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      console.log("Validation Errors:", validationErrors);
    }
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Failed to register admin" });
  }
};

exports.validateAdminLogin = [
  body("fullName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("password").isString().withMessage("Provide valid password"),
];
exports.loginAdmin = async (req, res) => {
  console.log("Session:", req.session); // Add this line to check the session object

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, password } = req.body;

    const admin = await Admin.findOne({ fullName });
    if (!admin) {
      return res.status(401).json({ message: "Invalid full name or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid full name or password" });
    }

    const token = jwt.sign(
      { id: admin._id, fullName: admin.fullName, role: admin.role },
      "secretkey",
      { expiresIn: "24h" }
    );

    // Check if req.session is defined before setting user
    if (req.session) {
      req.session.user = { id: admin._id, token };
    } else {
      console.error("Session is undefined");
      return res.status(500).json({ message: "Session error" });
    }

    res
      .status(200)
      .json({ token, role: admin.role, sessionId: req.session.id });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Validation Error:", error.message);
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      console.log("Validation Errors:", validationErrors);
    }
    console.error("Error logging in admin:", error);
    res.status(500).json({ message: "Failed to log in admin" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  admin.resetPasswordToken = resetToken;
  console.log(resetToken);
  admin.resetPasswordExpires = Date.now() + 3600000;

  await admin.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bethlehemgech@gmail.com",
      pass: "lfop nbfw ufmy ruoy",
    },
  });

  const mailOptions = {
    from: "bethlehemgech@gmail.com",
    to: "bethlehemgech@gmail.com",
    subject: "Password Reset Request",
    text:
      `Hello ${admin.fullName},\n\n` +
      `You have requested a password reset. Please use the following link to reset your password:\n\n` +
      `http://app-url/reset-password?token=${resetToken}\n\n`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending password reset email:", error);
    } else {
      console.log("Password reset email sent:", info.response);
    }
  });
};

exports.verifyPasswordReset = async (req, res) => {
  const { resetPasswordToken, password } = req.body;

  try {
    const admin = await Admin.findOne({
      resetPasswordToken: resetPasswordToken,
      // resetPasswordExpires: { $gt: Date.now() }, // Token should be valid
    });

    if (!admin) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getallAdmins = async (req, res) => {
  const admins = await Admin.find();

  if (!admins || admins.length === 0) {
    res.status(404).json({ message: "No Admins Found!" });
  } else {
    res.status(200).json(admins);
  }
};

exports.changeRole = async (req, res) => {
  const fullName = req.body.fullName;
  const newRole = req.body.newRole;
  const predefinedRoles = ["hr", "finance", "management", "super-admin"];

  try {
    if (!predefinedRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const admin = await Admin.findOneAndUpdate(
      {
        fullName: fullName,
      },
      {
        $set: {
          role: newRole,
        },
      },
      {
        new: true,
      }
    );

    if (!admin || admin.length === 0) {
      res.status(404).json({ message: "Admin Role Not Changed!" });
    } else {
      console.log(admin);
      res.status(201).json(admin);
    }
  } catch (error) {
    console.log("ERROR: ", error);
  }
};

exports.removeAdmin = async (req, res) => {
  const deletedAdmin = await Admin.findOneAndDelete({
    fullName: req.body.fullName,
  });

  if (!deletedAdmin) {
    res.status(500).json({ message: "Something went wrong!" });
  } else {
    res.status(200).json(deletedAdmin);
  }
};
