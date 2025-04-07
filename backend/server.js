//backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const path = require("path");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const { createDefaultAdmin } = require("./routes/auth");

// Load env vars
dotenv.config();

// Route files
const auth = require("./routes/auth");
const users = require("./routes/users");
const courses = require("./routes/courses");
const events = require("./routes/events");
const fees = require("./routes/fees");
const messages = require("./routes/messages");

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Use cookie-parser middleware
app.use(cookieParser());

// Set static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routers
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/courses", courses);
app.use("/api/events", events);
app.use("/api/fees", fees);
app.use("/api/messages", messages);



// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    createDefaultAdmin(); // Ensure default admin is created
  })
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));