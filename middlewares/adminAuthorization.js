const jwt = require("jsonwebtoken");
const secretKey = "secretkey"; // Properly declaring secretKey

function authorize(roles = []) {
  // Ensure 'roles' can be a single role or an array of roles
  if (typeof roles === "string") {
    roles = [roles]; // Convert to array if a single role is passed
  }

  return (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing or malformed" });
    }

    const token2 = token.split(" ")[1]; // Safer way to extract the token
    try {
      const payload = jwt.verify(token2, secretKey);

      req.user = payload;
      console.log("Roles passed to authorize:", roles);
      console.log("Payload role:", payload.role);
      // Allow super-admin access or users with the required roles
      if (payload.role === "super-admin" || roles.includes(payload.role)) {
        next();
      } else if (roles.includes("all")) {
        next();
      } else {
        return res.status(403).json({ message: "Unauthorized access" });
      }
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports = authorize;
