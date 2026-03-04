const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const reservationRoutes = require("./routes/reservations");

// ── Load environment variables ────────────────────────────────────────
require("dotenv").config();

// ── Initialise Express ────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "🏠 Flat Booking System API is running" });
});

app.use("/api/reservations", reservationRoutes);

// ── Start server after DB connection ──────────────────────────────────
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
