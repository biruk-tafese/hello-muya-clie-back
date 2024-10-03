const Settings = require("../models/settings/admin-settings");

exports.updateSettings = async (req, res) => {
  // Check if the settings exist in the database
  const previousSettings = await Settings.find();

  if (!previousSettings || previousSettings.length === 0) {
    // If the database had no previous settings entry, create new entry and set to default settings
    defaultSettings();
  } else {
    // Update the previous settings to new ones
    const settingsId = previousSettings[0]._id;
    const adminSettings = await Settings.findByIdAndUpdate(
      settingsId,
      req.body,
      { new: true }
    );

    return res.status(201).json(adminSettings);
  }
};

exports.getSettings = async (req, res) => {
  const settings = await Settings.find();

  return res.status(200).json(settings[0]);
};

exports.defaultSettings = async (req, res) => {
  // Default Settings for admins
  const defaultSettings = {
    generalSettings: {
      systemLanguage: "en",
      currency: "ETB",
    },
    customization: {
      theme: "light",
    },
    securitySettings: {
      passwordPolicy: {
        minLength: 6,
        requireSpecialChar: true,
      },
      accessControl: {
        restrictedFeatures: "",
      },
    },
    emailConfiguration: {
      smtpSettings: {
        host: "",
        port: 0,
        username: "",
        password: "",
      },
    },
    customization: {
      branding: {
        logoUrl: "logo-url",
        colorScheme: "color",
      },
      theme: "light",
    },
    helpAndSupportSettings: {
      documentationUrl: "documentation-url",
      faqUrl: "faq-url",
      supportEmail: "support-email",
    },
    systemUpdateSettings: {
      autoCheckUpdates: true,
    },
  };

  // Check if the settings are already in the database
  const previousSettings = await Settings.find();

  if (!previousSettings || previousSettings.length === 0) {
    // If the database had no previous settings entry, create new entry and set to default settings
    const adminSettings = await Settings.create(defaultSettings);

    return res.status(201).json(adminSettings);
  } else {
    // Set the previous settings to default
    const settingsId = previousSettings[0]._id;
    const adminSettings = await Settings.findByIdAndUpdate(
      settingsId,
      defaultSettings,
      { new: true }
    );

    return res.status(201).json(adminSettings);
  }
};
