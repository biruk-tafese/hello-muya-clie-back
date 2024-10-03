const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationControllers");
const authorize = require("../middlewares/adminAuthorization");


// ROUTE GET All Notifications
router.get(
  "/admin",
  authorize("all"),
  notificationController.getAdminNotifications
);

router.post("/admin/create", notificationController.createAdminNotification);

router.put("/admin/read", notificationController.updateReadStatus);

router.get(
  "/sp/:id",
  notificationController.getAllServiceProviderNotifications
);

router.post(
  "/sp/create",
  notificationController.createCustomServiceProviderNotification
);

router.post(
  "/sp/serviceRequest",
  notificationController.serviceRequestServiceProviderNotification
);

router.put(
  "/sp/read",
  notificationController.updateReadStatusServiceProviderNotification
);

router.post(
  "/sp/serviceComplete",
  notificationController.serviceCompletionServiceProviderNotification
);

router.get("/client/:id", notificationController.getAllClientNotifications);

router.post(
  "/client/create",
  notificationController.createCustomClientNotification
);

router.post(
  "/client/serviceAccept",
  notificationController.serviceAcceptedClientNotification
);

router.post(
  "/client/serviceComplete",
  notificationController.serviceCompletionClientNotification
);

router.put(
  "/client/read",
  notificationController.updateReadStatusClientNotification
);

module.exports = router;
