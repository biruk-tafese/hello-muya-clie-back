const Client = require("../models/clients/clientModel");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/otp_generator");
const sendMail = require("../utils/smtp_function");
exports.getAllClients = async (req, res) => {
  try {
    const Clients = await Client.find();
    res.json(Clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createClient = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create new client
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.loginClient = async (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: false,
      message: "Email is not valid",
    });
  }

  // Validate password length
  const minPasswordLength = 8;
  if (password.length < minPasswordLength) {
    return res.status(400).json({
      status: false,
      message:
        "Password should be at least " + minPasswordLength + " characters long",
    });
  }

  try {
    // Check if user exists
    const user = await Client.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }

    // Compare provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: "Wrong Password",
      });
    }

    // Generate JWT token for the user
    const userToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      "secretkey", // Consider moving this key to an environment variable
      { expiresIn: "21d" }
    );

    // Destructure user object to exclude sensitive data
    const {
      password: hashedPassword,
      createdAt,
      updatedAt,
      __v,
      otp,
      ...others
    } = user._doc;

    // Send user data along with the token
    res.status(200).json({ ...others, userToken });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.registerClient = async (req, res) => {
  const { email, password, username, phone, profession } = req.body;
  console.log(username);
  console.log(email);
  console.log(profession);
  // Ensure all required fields are present
  if (!email || !password || !username || !phone || !profession) {
    return res.status(400).json({
      status: false,
      message:
        "All fields (email, password, username, phone, profession) are required",
    });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: false, message: "Email is not valid" });
  }

  const minPasswordLength = 8;
  if (password.length < minPasswordLength) {
    return res.status(400).json({
      status: false,
      message:
        "Password should be at least " + minPasswordLength + " characters long",
    });
  }

  try {
    const user = await Client.findOne({ email });

    if (user) {
      if (!user.verification) {
        const otp = generateOtp();
        user.otp = otp;
        await user.save();
        sendMail(user.email, otp);

        return res.status(200).json({
          status: true,
          message:
            "Please verify your account. A new OTP has been sent to your email.",
        });
      }

      return res.status(400).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const newUser = new Client({
      username,
      email,
      phone,
      profession,
      fullName: username,
      password: hashedPassword, // Store the hashed password
      otp,
    });

    await newUser.save();
    sendMail(newUser.email, otp);

    const userToken = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        email: newUser.email,
      },
      "secretkey",
      { expiresIn: "21d" }
    );

    res.status(201).json({
      status: true,
      message: "Verification code is sent to your email account",
      userToken,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
exports.getClientById = async (req, res) => {
  try {
    const theClient = await Client.findById(req.params.id);
    if (!theClient) {
      return res.status(404).json({ message: "Client not found." });
    }
    res.json(theClient);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.verifyAccount = async (req, res) => {
  console.log(req.params.otp);
  const userOtp = req.params.otp;

  try {
    const user = await Client.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    if (userOtp === user.otp) {
      user.verification = true;
      user.otp = "none";

      await user.save();

      const userToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email,
        },
        "secretkey",
        { expiresIn: "21d" }
      );

      const { password, __v, otp, createdAt, ...others } = user._doc;
      res.status(200).json({ ...others, userToken });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Otp verification failed" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.updateClientById = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found." });
    }
    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteClientById = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found." });
    }
    res.json({ message: "Service provider deleted successfully." });
  } catch (error) {
    console.error("Error deleting service provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getClientsToday = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const clientsTodayCount = await Client.countDocuments({
      registrationDate: { $gte: startOfToday.toISOString() },
    });

    res.json({ count: clientsTodayCount });
  } catch (error) {
    console.error("Error fetching clients registered today:", error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

exports.getClientEachYear = async (req, res) => {
  try {
    const result = await Client.aggregate([
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

exports.approveClients = async (req, res) => {
  try {
    const approvedClient = await Client.findByIdAndUpdate(req.params.id, {
      $set: { status: "approved" },
    });
    res.json(approvedClient);
  } catch (error) {
    console.error("Error approving client:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.rejectClients = async (req, res) => {
  try {
    rejectedClient = await Client.findByIdAndUpdate(req.params.id, {
      $set: { status: "rejected" },
    });
    res.json(rejectedClient);
  } catch (error) {
    console.error("Error rejecting client:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.filterClients = async (req, res) => {
  try {
    let query = {};

    if (req.query.fullName) {
      query.fullName = req.query.fullName;
    }

    if (req.query.email) {
      query.email = { $regex: new RegExp(`^${req.query.email}$`, "i") };
    }

    if (req.query.fullName) {
      query.fullName = { $regex: new RegExp(req.query.fullName, "i") };
    }

    if (req.query.street) {
      query["address.street"] = req.query.street;
    }
    if (req.query.city) {
      query["address.city"] = req.query.city;
    }

    //   if (req.query.role) {
    //     query.role = req.query.role;
    //   }

    if (req.query.minRegistrationDate) {
      query.registrationDate = {
        $gte: new Date(req.query.minRegistrationDate),
      };
    }

    if (req.query.approvalStatus) {
      query.approvalStatus = req.query.approvalStatus;
    }

    if (req.query.serviceType) {
      query.serviceType = req.query.serviceType;
    }

    const Clients = await Client.find(query);

    res.json(Clients);
  } catch (error) {
    console.error("Error searching service providers:", error);
    res.status(500).json({ message: "Failed to search service providers" });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;

    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const query = {
      $or: [
        { fullName: searchTerm },
        { email: { $regex: new RegExp(`^${searchTerm}$`, "i") } },
        { fullName: { $regex: new RegExp(searchTerm, "i") } },
      ],
    };

    const clients = await Client.find(query);

    res.json(clients);
  } catch (error) {
    console.error("Error searching clients:", error);
    res.status(500).json({ message: "Failed to search clients" });
  }
};

exports.getTotalClient = async (req, res) => {
  try {
    const totalClient = await Client.countDocuments();
    res.status(200).send({
      count: totalClient,
    });
  } catch (error) {}
};

exports.getPendingClients = async (req, res) => {
  try {
    const getPendingTotal = await Client.countDocuments({ status: "pending" });
    res.status(200).send({ count: getPendingTotal });

    // If no pending service providers found, return an empty array
  } catch (error) {
    console.error("Error fetching pending service providers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch pending service providers" });
  }
};
exports.getPendingPercentageClients = async (req, res) => {
  try {
    const totalClient = await Client.countDocuments();
    const pendingClient = await Client.countDocuments({ status: "pending" });

    if (totalClient == 0) {
      return res.json({ percentage: 0 }); // Return after sending the response
    }

    const perClient = ((pendingClient / totalClient) * 100).toFixed(2);

    return res.status(200).send({ percentage: perClient }); // Ensure only one response is sent
  } catch (error) {
    console.error("Error fetching pending service providers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch pending service providers" });
  }
};

exports.getActiveClient = async (req, res) => {
  try {
    const activeCount = await Client.countDocuments({ status: "approved" });
    res.send({ count: activeCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
