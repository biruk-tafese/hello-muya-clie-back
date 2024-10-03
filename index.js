require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const WebSocket = require("ws"); // Import the WebSocket package
const webSocket = require("./websocket");
const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken");
const cron = require("node-cron");

const {
  pendingSPnotifications,
} = require("./controllers/notificationControllers");

const serviceProviderRoutes = require("./routers/serviceProviderRouters");
const clientRoutes = require("./routers/clientRouters");
const adminRoutes = require("./routers/adminAuthRouters");
const chatRoutes = require("./routers/chatRouters");
const financialRoutes = require("./routers/financialManagementRouters");
const notificationRoutes = require("./routers/notificationRouters");
const orderRoutes = require("./routers/orderRouters");
const locationRoutes = require("./routers/locationRoutes");
const serviceRequestRoute = require("./routers/serviceRequestRoutes");
const settingsRoutes = require("./routers/settingsRoutes");
const companyRoutes = require("./routers/companyRouter");
const IsAuth = require("./middlewares/ISAuth");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Initialize WebSocket server after the server is created
const wss = new WebSocket.Server({ server });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = require("socket.io")(server);

// Connect to MongoDB
const mongo_uri = process.env.MONGO_URI;
mongoose
  .connect(mongo_uri, {
    serverSelectionTimeoutMS: 50000, // 50 seconds
  })
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Create a MongoDB session store
const store = new MongoDBStore({
  uri: mongo_uri,
  collection: "sessions",
  connectionOptions: {
    serverSelectionTimeoutMS: 60000, // 60 seconds
    socketTimeoutMS: 45000, // 45 seconds
    retryWrites: true,
  },
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Do not save uninitialized sessions
    store: store,
    cookie: { secure: process.env.NODE_ENV === "production" }, // secure cookies in production
  })
);

// Add your routes here
// app.post("/login", async (req, res) => {
//   const { fullName, password } = req.body;
//   const admin = await Admin.findOne({ fullName });
//   if (admin && (await bcrypt.compare(password, admin.password))) {
//     req.session.user = { id: admin._id, isAuth: true };
//     res.status(200).send("Logged in");
//   } else {
//     res.status(401).send("Invalid credentials");
//   }
// });

app.use("/company/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/serviceProviders", serviceProviderRoutes);
app.use("/clients", clientRoutes);
app.use("/auth", adminRoutes);
app.use("/chat", chatRoutes);
app.use("/finance", financialRoutes);
app.use("/notifications", notificationRoutes);
app.use("/orders", orderRoutes);
app.use("/location", locationRoutes);
app.use("/serviceRequest", serviceRequestRoute);
app.use("/settings", settingsRoutes);
app.use("/company", companyRoutes);
app.use(
  "/uploads/profile",
  express.static(path.join(__dirname, "uploads/profile"))
);
// Example protected route
app.get("/dashboard", IsAuth, (req, res) => {
  res.send("This is the admin dashboard");
});

// Welcome route - ensure this is placed after other routes
app.get("/", (req, res) => {
  res.send("Welcome to hello balemoya!");
});

// Socket connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("updateLocation", (data) => {
    io.emit("locationUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// WebSocket connection
wss.on("connection", (ws, req) => {
  webSocket(ws, req);
});

// This code runs every hour to send automated notifications to the admins
// Please read the node-cron documentation before editing
cron.schedule("0 * * * *", () => {
  // Send the pending service providers notification
  pendingSPnotifications();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
