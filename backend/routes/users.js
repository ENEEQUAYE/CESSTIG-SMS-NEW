//backend/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");
const Fee = require("../models/Fee");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();
const path = require("path");

// ✅ Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// Helper function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};


router.get("/profile", authenticate, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json(user);
  } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Profile (Requires Authentication)
router.put("/update-profile", authenticate, async (req, res) => {
  try {
      const { firstName, lastName, contactNumber, position } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
          req.user.id,
          { firstName, lastName, contactNumber, position },
          { new: true, select: "-password" }
      );

      res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Profile Picture URL
router.get("/profile-pic/:userId", async (req, res) => {
  try {
      const user = await User.findById(req.params.userId);
      if (!user || !user.profilePicture) {
          return res.status(404).json({ message: "Profile picture not found" });
      }

      res.json({ profilePicture: user.profilePicture });
  } catch (error) {
      console.error("Error fetching profile picture:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// ==================== CRUD for Students ====================

// Create a new student
router.post("/students", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, email, phone, course, lecturer, enrollmentDate, country, address, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !email || !phone || !course || !lecturer || !enrollmentDate || !country || !address || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Generate a unique student ID
    const studentId = `STU${Math.floor(10000 + Math.random() * 90000)}`;

    // Create a new student
    const student = new User({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      course,
      lecturer,
      role: "student",
      studentId,
      enrollmentDate,
      country,
      address,
      password: hashedPassword,
    });

    await student.save();

    // Create a fee record for the student
    const fee = new Fee({
      student: student._id,
      course: student.course, // Ensure `course` is provided in the request
      amount: 1000, // Example fee amount, adjust as needed
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due date 30 days from now
      status: "Unpaid",
    });
    await fee.save();

    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all students
router.get("/students", authenticate, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
    .populate("course", "courseCode courseName")
    .populate("lecturer", "firstName lastName");
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update a student
router.put("/students/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating password directly
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const student = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a student
router.delete("/students/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findByIdAndDelete(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get the count of students
router.get("/students/count", authenticate, async (req, res) => {
    try {
      const count = await User.countDocuments({ role: "student" });
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error fetching student count:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// ==================== CRUD for Lecturers ====================

// Create a new lecturer
router.post("/lecturers", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, password, courses } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !department || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Generate a unique lecturer ID
    const lecturerId = `LECT${Math.floor(10000 + Math.random() * 90000)}`;

    // Create a new lecturer
    const lecturer = new User({
      firstName,
      lastName,
      email,
      phone,
      department,
      password: hashedPassword,
      role: "lecturer",
      lecturerId,
      courses,
    });

    await lecturer.save();
    res.status(201).json({ message: "Lecturer added successfully", lecturer });
  } catch (error) {
    console.error("Error adding lecturer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all lecturers
router.get("/lecturers", authenticate, async (req, res) => {
  try {
    const lecturers = await User.find({ role: "lecturer" })
    .populate("courses", "courseName courseCode");
    res.status(200).json({ success: true, data: lecturers });
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a lecturer
router.put("/lecturers/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating password directly
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const lecturer = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    res.status(200).json({ message: "Lecturer updated successfully", lecturer });
  } catch (error) {
    console.error("Error updating lecturer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a lecturer
router.delete("/lecturers/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const lecturer = await User.findByIdAndDelete(id);
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    res.status(200).json({ message: "Lecturer deleted successfully" });
  } catch (error) {
    console.error("Error deleting lecturer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get the count of lecturers
router.get("/lecturers/count", authenticate, async (req, res) => {
  try {
      const count = await User.countDocuments({ role: "lecturer" });
      res.status(200).json({ count });
  } catch (error) {
      console.error("Error fetching lecturer count:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// ==================== CRUD for Admins ====================

// Create a new admin
router.post("/admins", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !position || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Generate a unique admin ID
    const adminId = `ADMIN${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Create a new admin
    const admin = new User({
      firstName,
      lastName,
      email,
      phone,
      position,
      password: hashedPassword,
      role: "admin",
      adminId,
    });

    await admin.save();
    res.status(201).json({ message: "Admin added successfully", admin });
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all admins
router.get("/admins", authenticate, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update an admin
router.put("/admins/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating password directly
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const admin = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an admin
router.delete("/admins/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByIdAndDelete(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;