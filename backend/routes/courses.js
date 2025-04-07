//backend/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { authenticate } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure file uploads
const uploadDir = path.join(__dirname, "../uploads/courses");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `course-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only images (JPEG, PNG, GIF) are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// Middleware to handle file upload errors
const handleFileUpload = (req, res, next) => {
  upload.single("courseThumbnail")(req, res, (err) => {
    console.log("handleFileUpload: req.file", req.file); // Add this logging

    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err); // Log the Multer error
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      console.error("File upload error:", err); // Log other errors
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }

    // If no file was uploaded, set req.file to null to indicate this clearly
    if (!req.file) {
      console.log("No file uploaded for courseThumbnail");
      req.file = null; 
    }

    next();
  });
};

// Get all courses with pagination
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .populate("lecturer", "firstName lastName email")
      .populate("students", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Get course count
router.get("/count", authenticate, async (req, res) => {
  try {
    const count = await Course.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error counting courses:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Get course by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("lecturer", "firstName lastName email")
      .populate("students", "firstName lastName email");

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});


// Create new course
router.post("/", authenticate, handleFileUpload, async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { courseCode, courseName, courseDescription } = req.body;

    // Validate required fields
    if (!courseCode || !courseName || !courseDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Use req.file for courseThumbnail
    const courseThumbnail = req.file ? `/uploads/courses/${req.file.filename}` : undefined;

    const course = new Course({
      courseCode,
      courseName,
      courseDescription,
      courseThumbnail,
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get course by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("lecturer", "firstName lastName email")
      .populate("students", "firstName lastName email");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update course
router.put("/:id", authenticate, handleFileUpload, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Authorization check
    if (req.user.role !== "admin" && course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this course" });
    }

    const { courseCode, courseName, courseDescription } = req.body;
    const updates = {
      courseCode: courseCode || course.courseCode,
      courseName: courseName || course.courseName,
      courseDescription: courseDescription || course.courseDescription,
    };

    if (req.file) {
      // Delete old thumbnail if it's not the default
      if (course.courseThumbnail !== "/uploads/courses/default.jpg") {
        const oldFilePath = path.join(__dirname, "..", course.courseThumbnail);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updates.courseThumbnail = `/uploads/courses/${req.file.filename}`;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete course
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.user.role !== "admin" && course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this course" });
    }

    // Delete thumbnail if it's not the default
    if (course.courseThumbnail !== "/uploads/courses/default.jpg") {
      const filePath = path.join(__dirname, "..", course.courseThumbnail);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await course.deleteOne();
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
  
module.exports = router;