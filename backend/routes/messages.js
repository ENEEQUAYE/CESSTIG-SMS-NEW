// backend/routes/messages.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { authenticate } = require("../middleware/authMiddleware");

// Get all messages for a user (either as sender or recipient)
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .populate("sender", "firstName lastName profilePicture")
    .populate("recipient", "firstName lastName profilePicture")
    .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get conversation between two users
router.get("/conversation/:userId", authenticate, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    })
    .populate("sender", "firstName lastName profilePicture")
    .populate("recipient", "firstName lastName profilePicture")
    .sort({ createdAt: 1 });
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send a new message
router.post("/", authenticate, async (req, res) => {
  try {
    const { recipient, subject, content, attachment } = req.body;
    
    if (!recipient || !subject || !content) {
      return res.status(400).json({ message: "Recipient, subject and content are required" });
    }
    
    const newMessage = new Message({
      sender: req.user._id,
      recipient,
      subject,
      content,
      attachment,
      isRead: false
    });
    
    await newMessage.save();
    
    // Populate sender and recipient details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "firstName lastName profilePicture")
      .populate("recipient", "firstName lastName profilePicture");
    
    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully", 
      data: populatedMessage 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark message as read
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only the recipient can mark a message as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to perform this action" });
    }
    
    message.isRead = true;
    await message.save();
    
    res.status(200).json({ success: true, message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a message
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only sender or recipient can delete a message
    if (message.sender.toString() !== req.user._id.toString() && 
        message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to perform this action" });
    }
    
    await message.remove();
    
    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread message count
router.get("/unread/count", authenticate, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;