const jwt = require("jsonwebtoken");
const ServiceProvider = require("./models/service-providers/serviceProviderModel");
const secretKey = "secretkey"; // Make sure to use environment variables for sensitive data

module.exports = (ws, req) => {
  console.log("Client connected");

  // Listen for location updates from WebSocket connection
  ws.on("message", async (data) => {
    try {
      const locationData = JSON.parse(data);
      const { latitude, longitude, token } = locationData; // Extract token

      // Check if token is provided
      if (!token) {
        throw new Error("JWT token must be provided");
      }

      // Verify the JWT token and extract service provider ID
      const decoded = jwt.verify(token, secretKey); // Use your actual JWT secret
      const serviceProviderId = decoded.id;

      // Update the service provider's location in MongoDB
      await ServiceProvider.findByIdAndUpdate(serviceProviderId, {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        lastUpdated: Date.now(),
      });

      console.log(
        `Location updated for service provider ${serviceProviderId}:`,
        {
          latitude,
          longitude,
        }
      );

      // Send acknowledgment or updated data to the client
      ws.send(JSON.stringify({ success: "Location updated" }));
    } catch (error) {
      console.error("Error updating location:", error); // Log the error for debugging
      ws.send(
        JSON.stringify({ error: error.message || "Failed to update location" })
      );
    }
  });

  // Handle WebSocket disconnection
  ws.on("close", () => {
    console.log(`WebSocket closed for service provider ${serviceProviderId}`);
  });
};
