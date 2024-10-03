const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  generalSettings: {
    systemLanguage: {
      type: String,
      enum: ["en", "amh", "oro"],
      default: "en",
    },
    currency: {
      type: String,
      enum: ["ETB", "USD", "EUR"],
      default: "ETB",
    },
  },
  securitySettings: {
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 6,
      },
      requireSpecialChar: {
        type: Boolean,
        default: true,
      },
    },
    accessControl: {
      restrictedFeatures: [String],
    },
  },
  emailConfiguration: {
    emailTemplates: {
      welcomeEmail: {
        subject: String,
        body: String,
      },
      notificationEmail: {
        subject: String,
        body: String,
      },
    },
    smtpSettings: {
      host: String,
      port: Number,
      username: String,
      password: String,
    },
  },
  customization: {
    branding: {
      logoUrl: String,
      colorScheme: String,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  backupRestoreSettings: {
    lastBackupDate: {
      type: Date,
      default: Date.now,
    },
  },
  integrationSettings: {
    thirdPartyIntegrations: [
      {
        serviceName: String,
        apiKey: String,
      },
    ],
  },
  auditLogSettings: {
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  helpAndSupportSettings: {
    documentationUrl: String,
    faqUrl: String,
    supportEmail: String,
  },
  systemUpdateSettings: {
    autoCheckUpdates: {
      type: Boolean,
      default: true,
    },
  },
});

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
