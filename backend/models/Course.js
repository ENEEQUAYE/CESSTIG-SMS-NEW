//backend/models/Course.js
const mongoose = require("mongoose");
const path = require("path");

const CourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      trim: true,
      maxlength: [10, "Course code cannot exceed 10 characters"],
    },
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },
    courseDescription: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: [1000, "Course description cannot exceed 1000 characters"],
    },
    courseThumbnail: {
      type: String,
      default: "course1.jpg",
    },
    lecturer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true },
  }
);

// Virtual for student count
CourseSchema.virtual("studentCount").get(function () {
  return this.students?.length || 0;
});

// Add text index for search functionality
CourseSchema.index({
  courseCode: "text",
  courseName: "text", 
  courseDescription: "text"
});

module.exports = mongoose.model("Course", CourseSchema);