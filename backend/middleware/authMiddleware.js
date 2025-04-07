//backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken")
const User  = require("../models/User")

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1] // Get token from headers

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select("-password") // Attach user to req
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

module.exports = { authenticate }