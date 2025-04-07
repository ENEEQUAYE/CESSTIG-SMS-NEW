const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { authenticate } = require("../middleware/authMiddleware");

// Get all events
router.get("/", authenticate, async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "firstName lastName");
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new event
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, date, location, description } = req.body;
    const newEvent = new Event({
      name,
      date,
      location,
      description,
      createdBy: req.user._id,
    });
    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Edit an event
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an event
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;