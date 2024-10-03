const ServiceProvider = require("../models/service-providers/serviceProviderModel");
const Client = require("../models/clients/clientModel");
const { newSPregistered } = require("../controllers/notificationControllers");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const upload = require("../middlewares/uploadFile");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");

exports.validateServiceProvider = [
  body("username")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("username is required"),
  body("firstName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("First name is required"),
  body("lastName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("address").optional().isString().trim(),
  body("bio").optional().isString().trim(),
  body("socialMediaLinks.*").optional().isURL().withMessage("Invalid URL"),
];

exports.createServiceProvider = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

    // Create a new service provider object with the hashed password
    const newServiceProvider = new ServiceProvider({
      ...req.body,
      password: hashedPassword, // Use the hashed password
    });
    console.log(newServiceProvider);
    await newServiceProvider.save();
    console.log("i am here");
    newSPregistered();
    res.status(201).json(newServiceProvider);
  } catch (error) {
    console.error("Error creating service provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.loginServiceProviders = async (req, res) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!emailRegex.test(req.body.email)) {
    return res
      .status(400)
      .json({ status: false, message: "Email is not valid" });
  }

  const minPasswordLength = 8;

  if (req.body.password < minPasswordLength) {
    return res.status(400).json({
      status: false,
      message:
        "Password should be at least " + minPasswordLength + " characters long",
    });
  }

  try {
    const user = await ServiceProvider.findOne({ email: req.body.email });
    // res.status(200).json({ user });
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const depassword = await bcrypt.compare(req.body.password, user.password);

    if (!depassword) {
      return res.status(400).json({ status: false, message: "Wrong Password" });
    }

    const userToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      "secretkey",
      { expiresIn: "21d" }
    );

    const { password, createdAt, updatedAt, __v, otp, ...others } = user._doc;

    res.status(200).json({ ...others, userToken });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
exports.getAllServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find();
    res.json(serviceProviders);
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({ message: "Internal server error." });
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getServiceProviderById = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id);
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }
    res.json(serviceProvider);
  } catch (error) {
    console.error("Error fetching service provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateServiceProviderById = async (req, res) => {
  try {
    const serviceProviderId = req.params.id;

    if (!serviceProviderId || serviceProviderId.trim() === "") {
      return res
        .status(400)
        .json({ message: "Please Enter a Valid Service Provider ID!" });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceProviderId)) {
      return res
        .status(400)
        .json({ message: "Invalid Service Provider ID format." });
    }

    const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      serviceProviderId,
      req.body,
      { new: true }
    );

    if (!updatedServiceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }

    res.json(updatedServiceProvider);
  } catch (error) {
    console.error("Error updating service provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteServiceProviderById = async (req, res) => {
  try {
    const deletedServiceProvider = await ServiceProvider.findByIdAndDelete(
      req.params.id
    );
    if (!deletedServiceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }
    res.status(200).json({ message: "Service provider deleted successfully." });
  } catch (error) {
    console.error("Error deleting service provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getServiceProvidersToday = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const serviceProvidersToday = await ServiceProvider.find({
      registrationDate: { $gte: startOfToday.toISOString() },
    });

    res.json(serviceProvidersToday);
  } catch (error) {
    console.error("Error fetching service providers registered today:", error);
    res.status(500).json({ message: "Failed to fetch service providers" });
  }
};

exports.approveServiceProviders = async (req, res) => {
  try {
    const approvedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { $set: { approvalStatus: "Approved" } }
    );
    this.approveServiceProviders.status = "Approved";
    if (!this.approvedServiceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }
    res.json(approvedServiceProvider);
  } catch (error) {
    console.error("Error approving service provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.searchServiceProviders = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;

    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const serviceProviders = await ServiceProvider.find({
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { serviceType: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    });

    res.json(serviceProviders);
  } catch (error) {
    console.error("Error searching service providers:", error);
    res.status(500).json({ message: "Failed to search service providers" });
  }
};

exports.getPendingServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find({
      approvalStatus: "Pending",
    });

    if (!serviceProviders || serviceProviders.length === 0) {
      return res.json([]);
    }

    // Filter and extract pending service providers
    const pendingProviders = serviceProviders.filter(
      (provider) => provider.approvalStatus === "Pending"
    );

    return res.json(pendingProviders);
  } catch (error) {
    console.error("Error fetching pending service providers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch pending service providers" });
  }
};

exports.getApprovedServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find({
      approvalStatus: "Approved",
    });

    if (!serviceProviders || serviceProviders.length === 0) {
      return res.json([]);
    }

    const approvedProviders = serviceProviders.filter(
      (provider) => provider.approvalStatus === "Approved"
    );

    return res.json(approvedProviders);
  } catch (error) {
    console.error("Error fetching approved service providers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch approved service providers" });
  }
};

exports.getActiveServiceProvider = async (req, res) => {
  try {
    const activeCount = await ServiceProvider.countDocuments({
      approvalStatus: "Approved",
    });
    res.send({ count: activeCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateLocation = async (req, res) => {
  const id = req.params;
  const { latitude, longitude } = req.body;

  try {
    const serviceProvider = await ServiceProvider.findById(id);
    if (serviceProvider) {
      serviceProvider.latitude = latitude;
      serviceProvider.longitude = longitude;
      await serviceProvider.save();

      req.app.get("io").emit("location-updated", {
        id: serviceProvider._id,
        latitude: serviceProvider.latitude,
        longitude: serviceProvider.longitude,
      });
      res.status(200).send("Location updated successfully");
    } else {
      res.status(404).send("Service provider not found");
    }
  } catch (error) {
    res.status(500).send("Error updating location");
  }
};

exports.getSPLocations = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find().select(
      "latitude longitude"
    );
    res.status(200).json(serviceProviders);
  } catch (error) {
    res.status(500).send("Error Fetching locations");
  }
};

exports.getServiceProviderEachYear = async (req, res) => {
  try {
    const result = await ServiceProvider.aggregate([
      {
        $group: {
          _id: { $month: "$registrationDate" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const monthlyCounts = Array(12).fill(0); // Initialize an array with 12 zeros
    result.forEach((item) => {
      monthlyCounts[item._id - 1] = item.count;
    });

    res.json(monthlyCounts);
  } catch (error) {
    res.status(500).send({
      message: "Unable to fetch service provider",
    });
  }
};

exports.getNewClientsAndProviders = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(
      new Date().setDate(new Date().getDate() - 30)
    );

    // Log the date for debugging
    console.log("Date 30 days ago:", thirtyDaysAgo);

    // Count of new clients
    const newClients = await Client.countDocuments({
      registrationDate: { $gte: thirtyDaysAgo },
    });
    console.log("New Clients:", newClients);

    // Count of new service providers
    const newProviders = await ServiceProvider.countDocuments({
      registrationDate: { $gte: thirtyDaysAgo },
    });
    console.log("New Providers:", newProviders);

    if (newClients === 0 && newProviders === 0) {
      return res.status(404).json({
        message: "No new clients or providers found in the last 30 days.",
      });
    }

    res.status(200).json({
      newClients,
      newProviders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Client/Provider Retention
exports.getClientProviderRetention = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalProviders = await ServiceProvider.countDocuments();

    // Assuming retention is defined as those who registered in the last 6 months
    const retainedClients = await Client.countDocuments({
      registrationDate: {
        $lt: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      },
    });
    const retainedProviders = await ServiceProvider.countDocuments({
      registrationDate: {
        $lt: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      },
    });

    res.status(200).json({
      totalClients,
      totalProviders,
      retainedClients,
      retainedProviders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceProviderByUsername = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find({
      username: req.params.username,
    });

    if (!serviceProviders || serviceProviders.length === 0) {
      return res.status(404).json([]);
    }

    const serviceProvider = serviceProviders.filter(
      (provider) => provider.username === req.params.username
    );

    return res.status(200).json(serviceProvider);
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong!" });
  }
};

exports.getServiceProviderByEmail = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find({
      email: req.params.email,
    });

    if (!serviceProviders || serviceProviders.length === 0) {
      return res.status(404).json([]);
    }

    const serviceProvider = serviceProviders.filter(
      (provider) => provider.email === req.params.email
    );

    return res.status(200).json(serviceProvider);
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong!" });
  }
};

exports.Uploadfile = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const serviceProviderId = req.body._id;

    const updatedImages = req.files
      .filter((file) => file.mimetype.startsWith("image/"))
      .map((file) => ({
        path: file.path,
      }));

    const updatedDocuments = req.files
      .filter((file) => !file.mimetype.startsWith("image/"))
      .map((file) => ({
        path: file.path,
      }));

    const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      serviceProviderId,
      {
        $push: {
          uploadedDocuments: { $each: updatedDocuments },
          uploadedImages: { $each: updatedImages },
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Uploaded successfully!",
      data: updatedServiceProvider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.Sendfile = async (req, res) => {
  try {
    const rootDir = path.join("..", "backend");
    const filepath = path.join("/", req.body.path);
    if (req.body.path === "") {
      res.status(404).json({ message: "Path empty" });
    } else {
      res.sendFile(filepath, { root: rootDir });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  const filePath = req.body.filePath;
  const serviceProviderId = req.body.serviceProviderId;

  try {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        res.status(500).json({ message: "Something Went Wrong!" });
      }
    });

    // Update Database Entries
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    // Update Documents Entry
    const uploadedDocuments = serviceProvider.uploadedDocuments;
    const updatedDocuments = uploadedDocuments.filter(
      (item) => item.path !== filePath
    );

    // Update Images Entry
    const uploadedImages = serviceProvider.uploadedImages;
    const updatedImages = uploadedImages.filter(
      (item) => item.path !== filePath
    );

    const updatedServiceProvider = await ServiceProvider.findByIdAndUpdate(
      serviceProviderId,
      {
        uploadedDocuments: updatedDocuments,
        uploadedImages: updatedImages,
      },
      { new: true }
    );

    res.status(200).json({ updatedServiceProvider });
    console.log("File deleted successfully!");
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Something Went Wrong!" });
  }
};
exports.updateProfile = async (req, res) => {
  const userId = req.user.id; // Assuming the user ID comes from the authenticated user
  const { firstName, lastName, description } = req.body;
  const imagePath = req.file?.filename; // Check if there's an uploaded file

  try {
    // Find the user and get the current profile image path
    const user = await ServiceProvider.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the update object
    const updateFields = {};

    // Add fields to update only if they are not null or undefined
    if (firstName) {
      updateFields.firstName = firstName;
    }
    if (lastName) {
      updateFields.lastName = lastName;
    }
    if (description) {
      updateFields.description = description;
    }

    if (imagePath) {
      // Check if the user already has a profile image and it's not a default image
      const oldImagePath = user.profile
        ? path.join(__dirname, "../uploads/profile", user.profile)
        : null;
      const defaultImageNames = ["image-1632717633130.png"]; // Add your default image names here

      if (oldImagePath && !defaultImageNames.includes(user.profile)) {
        // Only delete if the old image is not a default image and has the same name as the new one
        if (fs.existsSync(oldImagePath) && user.profile !== imagePath) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(`Failed to delete old image: ${err.message}`);
            } else {
              console.log("Old image deleted successfully.");
            }
          });
        } else {
          console.log(
            "Old image file does not exist or has the same name as the new image, skipping deletion."
          );
        }
      }

      // Update the profile with the new image path
      updateFields.profile = imagePath;
    }
    // Update the user document
    await ServiceProvider.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    // Get the updated profile
    const updatedProfile = await ServiceProvider.findById(userId).select(
      "profile description firstName lastName"
    );

    // Send the updated profile in the response
    res.status(201).json({
      message: "Profile and image path updated successfully!",
      profile: updatedProfile,
    });
  } catch (e) {
    console.error(`Error updating profile: ${e.message}`); // Added logging for debugging
    return res.status(500).json({
      resp: false,
      msg: e.message,
    });
  }
};
// exports.updateLocation = async (req, res) => {
//   const userId = req.user.id;
//   const { latitude, longitude } = req.body;

//   try {
//     // Update the service provider's location in the database
//     await ServiceProvider.findByIdAndUpdate(userId, {
//       location: {
//         type: "Point",
//         coordinates: [longitude, latitude],
//       },
//     });

//     // Notify all clients about the updated location
//     // broadcastLocationUpdate(userId, latitude, longitude);

//     res.status(200).send({ message: "Location updated successfully" });
//   } catch (error) {
//     res.status(500).send({ error: "Failed to update location" });
//   }
// };

// // Function to broadcast location updates to all connected WebSocket clients
// function broadcastLocationUpdate(userId, latitude, longitude) {
//   const { clients } = require("../websocket"); // Import clients map from the websocket module

//   const message = JSON.stringify({
//     userId,
//     latitude,
//     longitude,
//   });

//   // Broadcast to all connected clients
//   clients.forEach((client, clientId) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(message);
//     }
//   });
// }
exports.updateLocation = async (req, res, ws = null) => {
  try {
    const serviceProviderId = req.user.id;

    const { latitude, longitude } = req.body;

    // Update the service provider's location in MongoDB
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      serviceProviderId,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        lastUpdated: Date.now(),
      },
      { new: true } // Return the updated document
    );

    if (!updatedProvider) {
      if (ws) {
        ws.send(JSON.stringify({ error: "Service Provider not found" }));
        ws.close();
      } else {
        return res.status(404).json({ message: "Service Provider not found" });
      }
    }

    const successMessage = {
      success: "Location updated",
      provider: updatedProvider,
    };

    if (ws) {
      // If WebSocket is present, send success response over WebSocket
      ws.send(JSON.stringify(successMessage));
    } else {
      // Otherwise, send response over HTTP
      return res.status(200).json(successMessage);
    }
  } catch (error) {
    console.error(error);
    const errorMessage = { message: "Something Went Wrong!" };

    if (ws) {
      ws.send(JSON.stringify(errorMessage));
      ws.close();
    } else {
      return res.status(500).json(errorMessage);
    }
  }
};
