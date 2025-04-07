//backend/routes/auth.js
const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Function to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login request received:", { email, role });

    if (!email || !password || !role) {
      console.log("Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("User found:", { email: user.email, role: user.role });

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      console.log("Role mismatch:", { expected: user.role, provided: role });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Checking password...");
    const isMatch = await user.correctPassword(password);
    console.log("Password check result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Generating token...");
    const token = generateToken(user._id, user.role);
    console.log("Login successful for:", email);

    res.json({
      token,
      user: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        role: user.role,
        profilePicture: user.profilePicture,
        phone: user.phone,
        studentId: user.studentId,
        dateOfBirth: user.dateOfBirth,
        course: user.course,
        lecturer: user.lecturer,
        isActive: user.isActive,
        enrollmentDate: user.enrollmentDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        adminId: user.adminId,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
module.exports.createDefaultAdmin = async function createDefaultAdmin() {
    const User = require("../models/User");
  
    const defaultAdminEmail = "admin@cesstig.edu";
    const existing = await User.findOne({ email: defaultAdminEmail });
  
    if (!existing) {
      const defaultAdmin = new User({
        firstName: "Emmanuel",
        lastName: "Neequaye",
        email: defaultAdminEmail,
        phone: "+233559340192",
        role: "admin",
        password: "Genius@0423!#",
        position: "Principal",
        profilePicture: "img/user.jpg",
        adminId: "ADM001",
      });
  
      await defaultAdmin.save();
      console.log("✅ Default admin created:", defaultAdminEmail);
    } else {
      console.log("ℹ️ Default admin already exists:", defaultAdminEmail);
    }
  };