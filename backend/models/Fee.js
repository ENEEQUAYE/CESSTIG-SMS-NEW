const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Payment amount is required"],
    min: [0, "Payment amount cannot be negative"],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Bank Transfer", "Mobile Money", "Online Payment", "Cheque"],
    required: [true, "Payment method is required"],
  },
  transactionRef: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

const FeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student is required"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required"],
  },
  feeType: {
    type: String,
    enum: ["Tuition", "Transport", "Hostel", "Examination", "Library", "Other"],
    default: "Tuition",
  },
  amount: {
    type: Number,
    required: [true, "Fee amount is required"],
    min: [0, "Fee amount cannot be negative"],
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, "Amount paid cannot be negative"],
  },
  balance: {
    type: Number,
    default: function () {
      return this.amount - this.amountPaid
    },
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"],
  },
  status: {
    type: String,
    enum: ["Paid", "Partial", "Unpaid"],
    default: "Unpaid",
  },
  payments: [PaymentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Pre-save middleware to update balance and status
FeeSchema.pre("save", function (next) {
  // Calculate total amount paid
  if (this.payments && this.payments.length > 0) {
    this.amountPaid = this.payments.reduce((total, payment) => total + payment.amount, 0)
  } else {
    this.amountPaid = 0
  }

  // Calculate balance
  this.balance = this.amount - this.amountPaid

  // Update status
  if (this.balance <= 0) {
    this.status = "Paid"
  } else if (this.amountPaid > 0) {
    this.status = "Partial"
  } else {
    this.status = "Unpaid"
  }

  next()
})

module.exports = mongoose.model("Fee", FeeSchema)

