const express = require("express");
const router = express.Router();
const serviceProviderController = require("../controllers/serviceProviderControllers");
const authorize = require("../middlewares/adminAuthorization");
const upload = require("../middlewares/uploadFile");

// Route: GET Service Provider by ID
router.get(
  "/sp/:id",
  authorize("hr"),
  serviceProviderController.getServiceProviderById
);

// Route: GET Service Provider BY USERNAME
router.get(
  "/user/:username",
  authorize("hr"),
  serviceProviderController.getServiceProviderByUsername
);

// Route: GET Service Provider BY EMAIL
router.get(
  "/check/:email",
  authorize("hr"),
  serviceProviderController.getServiceProviderByEmail
);

// Route: POST Create New Service Provider Account
router.post(
  "/create",
  authorize("hr"),
  serviceProviderController.validateServiceProvider,
  serviceProviderController.createServiceProvider
);
router.post("/login", serviceProviderController.loginServiceProviders);

// Route: GET NEW Service Providers registered today
router.get(
  "/latest",
  authorize("hr"),
  serviceProviderController.getServiceProvidersToday
);
router.put(
  "/change-profile",
  [authorize("service-provider"), upload.uploadProfile.single("image")],
  serviceProviderController.updateProfile
);
// Route: GET ALL Service Providers registered
router.get(
  "/all",
  authorize(["hr", "client"]),
  serviceProviderController.getAllServiceProviders
);

// Route: GET Service Providers with a PENDING status
router.get(
  "/pending",
  authorize("hr"),
  serviceProviderController.getPendingServiceProviders
);

// Route: GET Service Providers with APPROVED status
router.get(
  "/approved",
  authorize("hr"),
  serviceProviderController.getApprovedServiceProviders
);

// Route: GET Service Providers Registered Each Year
router.get(
  "/serviceProviderEachYear",
  authorize("hr"),
  serviceProviderController.getServiceProviderEachYear
);

// Route: GET NEW Clients and Servide Providers
router.get(
  "/newClientsAndProviders",
  authorize("hr"),
  serviceProviderController.getNewClientsAndProviders
);

// Route: GET Client - Service Provider Retention
router.get(
  "/clientProviderRetention",
  authorize("hr"),
  serviceProviderController.getClientProviderRetention
);

// Route: PUT Update Service Provider by  ID
router.put(
  "/update/:id",
  authorize("hr"),
  serviceProviderController.updateServiceProviderById
);

// Route: POST Upload Documents and Images
router.post(
  "/upload",
  authorize("hr"),
  upload.upload.any(),
  serviceProviderController.Uploadfile
);

// Route: POST Send FILE to FRONTEND
router.post(
  "/file",
  upload.upload.single("path"),
  authorize("hr"),
  serviceProviderController.Sendfile
);

// Route: POST Delete File From Server and remove from database
router.post(
  "/deleteFile",
  authorize("hr"),
  serviceProviderController.deleteFile
);
router.post(
  "/update-location",
  authorize("service-provider"),
  serviceProviderController.updateLocation // Now calls the controller directly
);

// Route: GET Search Results Service Provider
router.get(
  "/search",
  authorize("hr"),
  serviceProviderController.searchServiceProviders
);

// Route: GET Delete Service Provider By ID
router.get(
  "/delete/:id",
  authorize("hr"),
  serviceProviderController.deleteServiceProviderById
);

module.exports = router;
