//backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
      match: [/^[a-zA-Z]+$/, "First name can only contain letters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      match: [/^[a-zA-Z]+$/, "Last name can only contain letters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: (v) => /^\+?\d{10,15}$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    role: {
      type: String,
      enum: {
        values: ["student", "lecturer", "admin"],
        message: "Role must be either student, lecturer, or admin",
      },
      required: [true, "Role is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password in queries
    },
    profilePicture: {
      type: String,
      default: "img/user.jpg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Student-specific fields
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values without triggering unique error
      required: function () {
        return this.role === "student"
      },
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: function () {
        return this.role === "student"
      },
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (value) {
          if (this.role !== "student") return true
          const lecturer = await mongoose.model("User").findById(value)
          return lecturer && lecturer.role === "lecturer"
        },
        message: "Lecturer reference must point to a valid lecturer",
      },
    },
    country: {
      type: String,
      required: function () {
        return this.role === "student"; // Only required for students
      },
    },
    enrollmentDate: {
      type: Date,
      required: function () {
        return this.role === "student"
      },
      validate: {
        validator: (value) => value <= new Date(),
        message: "Enrollment date cannot be in the future",
      },
    },
    dateOfBirth: {
        type: Date,
        required: function () {
            return this.role === "student"
        },
        validate: {
            validator: (value) => value <= new Date(),
            message: "Date of birth cannot be in the future",
        },
    },
   


    // Lecturer-specific fields
    lecturerId: {
        type: String,
        unique: true,
        sparse: true,
        required: function () {
        return this.role === "lecturer";
        },
    },
    department: {
        type: String,
        required: function () {
        return this.role === "lecturer";
        },
        enum: {
        values: ["Sterile Processing", "Business", "Arts", "Health Sciences", "Medicine"],
        message: "Department is not valid",
        },
    },
    courses: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        },
    ],

    // Admin-specific fields
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "admin"
      },
    },
    position: {
      type: String,
      required: function () {
        return this.role === "admin"
      },
    },

    // Password reset fields
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-save middleware to hash passwords
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance method to compare passwords
UserSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema)

