const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientControllers");
const authorize = require("../middlewares/adminAuthorization");

// const client = require('../models/service-providers/clientModel');

// Route: GET all service providers
router.get(
  "/",
  authorize(["hr", "service-provider"]),
  clientController.getAllClients
);

router.get("/today", authorize("hr"), clientController.getClientsToday);

router.get(
  "/getClientByMonth",
  authorize("hr"),
  clientController.getClientEachYear
);

router.get(
  "/getActiveClient",
  authorize("hr"),
  clientController.getActiveClient
);
router.get("/getTotalClient", authorize("hr"), clientController.getTotalClient);

router.get(
  "/getPendingClient",
  authorize("hr"),
  clientController.getPendingClients
);

router.get(
  "/getPendingPercentageClients",
  authorize("hr"),
  clientController.getPendingPercentageClients
);
router.get("/verify/:otp", authorize("client"), clientController.verifyAccount);
router.post("/login", clientController.loginClient);
router.post("/register", clientController.registerClient);
router.put("/:id/approve", authorize("hr"), clientController.approveClients);
router.put("/:id/reject", authorize("hr"), clientController.rejectClients);

router.get("/search", authorize("hr"), clientController.searchClients);
// Route: GET service provider by ID
router.get("/:id", authorize("hr"), clientController.getClientById);

router.post("/create", clientController.createClient);
// Route: PUT update service provider by ID
router.put("/:id", authorize("hr"), clientController.updateClientById);
// Route: DELETE service provider by ID
router.delete("/:id", authorize("hr"), clientController.deleteClientById);

///filter needs some work
// router.get('/filter', clientController.filterClients);

module.exports = router;
