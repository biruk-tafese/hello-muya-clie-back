const AdminNotification = require("../models/notifications/adminNotification");
const ServiceProviderNotification = require("../models/notifications/serviceProviderNotification");
const ClientNotification = require("../models/notifications/clientNotification");
const Admin = require("../models/admin/adminModel");
const ServiceProvider = require("../models/service-providers/serviceProviderModel");

// NOTIFICATIONS FOR Admins
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find({
      recipient: req.user.id,
    });
    console.log(notifications);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createAdminNotification = async (req, res) => {
  const notificationContent = {
    recipient: req.session.user.id,
    message: req.body.message,
  };

  try {
    const newNotification = await AdminNotification.create(notificationContent);
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createSystemNotification = async (req, res) => {
  const notificationContent = {
    recipient: req.session.user.id,
    message: req.body.message,
    type: "System",
  };

  try {
    const newNotification = await AdminNotification.create(notificationContent);
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.newSPregistered = async () => {
  try {
    const admins = await Admin.find();
    const sp = await ServiceProvider.find();

    if (admins.length > 0) {
      for (const admin of admins) {
        if (admin.role === "hr" || admin.role === "super-admin") {
          const notificationContent = {
            recipient: admin._id,
            message:
              "New Service Provider Registered. Please check their credentials and approve or reject their request at your earliest convenience.",
            type: "System",
          };
          await AdminNotification.create(notificationContent);
          console.log("SP registration notification sent to admins!");
        }
      }
      if (sp.length % 100 === 0) {
        for (const admin of admins) {
          const notificationContent = {
            recipient: admin._id,
            message: `We have reached ${sp.length} number of service providers registered. Congratulations on this milestone.`,
            type: "System",
          };
          await AdminNotification.create(notificationContent);
          console.log("SP Number Milestone notification sent to admins!");
        }
      }
    }
  } catch (error) {
    console.error("Error creating notification!", error);
  }
};

exports.pendingSPnotifications = async () => {
  try {
    const admins = await Admin.find();
    const serviceProviders = await ServiceProvider.find({
      approvalStatus: "Pending",
    });

    if (!serviceProviders || serviceProviders.length === 0) {
      console.log("No Pending Service Providers found!");
      return;
    } else {
      const pending = serviceProviders.length;
      if (admins.length > 0) {
        for (const admin of admins) {
          if (admin.role === "hr" || admin.role === "super-admin") {
            const notificationContent = {
              recipient: admin._id,
              message: `We have ${pending} pending service providers. Please check their credentials and approve or reject their request at your earliest convenience.`,
              type: "System",
            };

            await AdminNotification.create(notificationContent);
            console.log("SP registration notification sent to admins!");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error creating notification!", error);
  }
};

exports.updateReadStatus = async (req, res) => {
  const { _id } = req.body;
  const checkStatus = await AdminNotification.findOne({ _id });
  if (checkStatus) {
    if (!checkStatus.read) {
      const updated = await AdminNotification.updateOne(
        { _id: _id },
        { $set: { read: true } }
      );
      if (updated.modifiedCount === 1) {
        res.status(200).json({ message: "Notification Updated!" });
      } else {
        res.status(500).json({ message: "Internal Server Error!" });
      }
    } else {
      res.status(400).json({ message: "Notification already Read!" });
    }
  } else {
    res.status(404).json({ message: "Notification not found!" });
  }
};

// Automated and Custom Notifications Creation for USERS - Both SERVICE PROVIDERS and CLIENTS
// NOTIFICATIONS FOR SERVICE PROVIDERS

// Custom Notification for Service Providers
exports.createCustomServiceProviderNotification = async (req, res) => {
  const notificationContent = {
    recipient: req.body.serviceProviderId,
    message: req.body.message,
  };

  try {
    const newNotification = await ServiceProviderNotification.create(
      notificationContent
    );
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Automated Notification for Service Provider

// When New Service is Requested
exports.serviceRequestServiceProviderNotification = async (req, res) => {
  const serviceProviderId = req.body.serviceProviderId;
  const serviceProviderusername = req.body.serviceProviderusername;
  const serviceType = req.body.serviceType;
  const clientName = req.body.clientName;

  const serviceRequestMessage = `Dear ${serviceProviderusername}, you have received a new service request from ${clientName} for ${serviceType}. Please review and respond at your earliest convenience.`;

  const notificationContent = {
    recipient: serviceProviderId,
    message: serviceRequestMessage,
  };

  try {
    const newNotification = await ServiceProviderNotification.create(
      notificationContent
    );
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// When Service is Completed
exports.serviceCompletionServiceProviderNotification = async (req, res) => {
  const serviceProviderId = req.body.serviceProviderId;
  const serviceProviderusername = req.body.serviceProviderusername;
  const serviceType = req.body.serviceType;
  const clientName = req.body.clientName;

  const serviceCompleteMessage = `Dear ${serviceProviderusername}, the ${serviceType} service for ${clientName} has been successfully completed. Thank you for your excellent service.`;

  const notificationContent = {
    recipient: serviceProviderId,
    message: serviceCompleteMessage,
  };

  try {
    const newNotification = await ServiceProviderNotification.create(
      notificationContent
    );
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// When Notification is read
exports.updateReadStatusServiceProviderNotification = async (req, res) => {
  const { _id } = req.body;
  const checkStatus = await ServiceProviderNotification.findOne({ _id });
  if (checkStatus) {
    if (!checkStatus.read) {
      const updated = await ServiceProviderNotification.updateOne(
        { _id: _id },
        { $set: { read: true } }
      );
      if (updated.modifiedCount === 1) {
        res.status(200).json({ message: "Notification Updated!" });
      } else {
        res.status(500).json({ message: "Internal Server Error!" });
      }
    } else {
      res.status(400).json({ message: "Notification already Read!" });
    }
  } else {
    res.status(404).json({ message: "Notification not found!" });
  }
};

// NOTIFICATIONS FOR CLIENTS

// Custom Notification for Clients
exports.createCustomClientNotification = async (req, res) => {
  const notificationContent = {
    recipient: req.body.clientId,
    message: req.body.message,
  };

  try {
    const newNotification = await ClientNotification.create(
      notificationContent
    );
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Automated Notification for Clients

// When New Service is Accepted by Service Provider
exports.serviceAcceptedClientNotification = async (req, res) => {
  const clientId = req.body.clientId;
  const serviceProviderusername = req.body.serviceProviderusername;
  const serviceProviderPhone = req.body.serviceProviderPhone;
  const clientName = req.body.clientName;

  const serviceRequestMessage = `Dear ${clientName}, your service request has been accepted by a nearby service provider, ${serviceProviderusername}. You will receive a call from ${serviceProviderPhone} shortly. Click here for more information or to track your order status.`;

  const notificationContent = {
    recipient: clientId,
    message: serviceRequestMessage,
  };

  try {
    const newNotification = await ClientNotification.create(
      notificationContent
    );
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// When Service is Completed
exports.serviceCompletionClientNotification = async (req, res) => {
  const clientId = req.body.clientId;
  const serviceProviderusername = req.body.serviceProviderusername;
  const serviceType = req.body.serviceType;
  const clientName = req.body.clientName;

  const serviceCompleteMessage = `Dear ${clientName}, your service request for ${serviceType} has been successfully completed by ${serviceProviderusername}. We value your feedback; please take a moment to complete this survey:`;
  const notificationContent = {
    recipient: clientId,
    message: serviceCompleteMessage,
  };

  try {
    const newNotification = await ClientNotification.create(
      notificationContent
    );
    res.status(200).json(newNotification);
  } catch (error) {
    console.error("Error creating notification!", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get All Notifications for Service Provider by ID
exports.getAllServiceProviderNotifications = async (req, res) => {
  const serviceProviderId = req.params.id;
  try {
    const Notifications = await ServiceProviderNotification.find({
      recipient: serviceProviderId,
    });

    res.status(200).json(Notifications);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something Went Wrong!" });
  }
};

// Get All Notifications for Client by ID
exports.getAllClientNotifications = async (req, res) => {
  const clientId = req.params.id;
  try {
    const Notifications = await ClientNotification.find({
      recipient: clientId,
    });

    res.status(200).json(Notifications);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ message: "Something Went Wrong!" });
  }
};

// When Notification is read
exports.updateReadStatusClientNotification = async (req, res) => {
  const { _id } = req.body;
  const checkStatus = await ClientNotification.findOne({ _id });
  if (checkStatus) {
    if (!checkStatus.read) {
      const updated = await ClientNotification.updateOne(
        { _id: _id },
        { $set: { read: true } }
      );
      if (updated.modifiedCount === 1) {
        res.status(200).json({ message: "Notification Updated!" });
      } else {
        res.status(500).json({ message: "Internal Server Error!" });
      }
    } else {
      res.status(400).json({ message: "Notification already Read!" });
    }
  } else {
    res.status(404).json({ message: "Notification not found!" });
  }
};
