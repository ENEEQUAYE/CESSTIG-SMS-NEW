const express = require("express");
const router = express.Router();
const Fee = require("../models/Fee");
const { authenticate } = require("../middleware/authMiddleware");

// Get all fees
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};
    if (search) {
      query["student.firstName"] = { $regex: search, $options: "i" };
    }

    const fees = await Fee.find(query)
      .populate("student", "firstName lastName studentId")
      .populate("course", "courseName")
      .limit(limit)
      .skip((page - 1) * limit);

    const totalFees = await Fee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: fees,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(totalFees / limit),
        hasNext: page * limit < totalFees,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update fee payment
router.post("/:id/payment", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionRef, remarks } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    fee.payments.push({
      amount,
      paymentMethod,
      transactionRef,
      remarks,
      recordedBy: req.user._id,
    });

    await fee.save();
    res.status(200).json({ message: "Payment updated successfully", fee });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get payment history
router.get("/:id/payments", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const fee = await Fee.findById(id).populate("payments.recordedBy", "firstName lastName");
    if (!fee) return res.status(404).json({ message: "Fee not found" });
    res.status(200).json({ success: true, payments: fee.payments });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/total", authenticate, async (req, res) => {
    try {
      const total = await Fee.aggregate([
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]);
      res.status(200).json({ total: total[0]?.total || 0 });
    } catch (error) {
      console.error("Error fetching total fees:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;