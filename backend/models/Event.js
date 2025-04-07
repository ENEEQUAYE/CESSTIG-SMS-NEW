const mongoose = require("mongoose")

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Event name is required"],
    trim: true,
    maxlength: [100, "Event name cannot exceed 100 characters"],
  },
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  location: {
    type: String,
    required: [true, "Event location is required"],
    trim: true,
    maxlength: [100, "Event location cannot exceed 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Event description cannot exceed 1000 characters"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Event", EventSchema)

