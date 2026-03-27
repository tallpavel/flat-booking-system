// ── Load environment variables (must be first!) ──────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectDB = require("./config/db");
const reservationRoutes = require("./routes/reservations");
const reservationConfirmRoutes = require("./routes/reservationConfirm");
const reservationsConfirmedRoutes = require("./routes/reservationsConfirmed");
const contactRoutes = require("./routes/contact");
const dailyRatesRoutes = require("./routes/dailyRates");
const stripeWebhookRoutes = require("./routes/stripeWebhook");
const adminAuthRoutes = require("./routes/adminAuth");
const adminStatsRoutes = require("./routes/adminStats");
const checkInRoutes = require("./routes/checkin");
const blockedDatesRoutes = require("./routes/blockedDates");
const seasonalRatesRoutes = require("./routes/seasonalRates");
const { requireAdmin } = require("./config/authMiddleware");

// ── Initialise Express ────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    "http://localhost:5173",  // Vite dev server (paraiso-booking-app)
    "http://localhost:4173",  // Vite preview
    "http://localhost:5174",
    "http://localhost:5175",
    "http://13.50.243.218",   // AWS EC2 public IP
    "http://ec2-13-50-243-218.eu-north-1.compute.amazonaws.com", // AWS EC2 public DNS
    "https://paraiso-booking.duckdns.org",
];

app.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middle-ware to dynamically resolve frontend URL for absolute links in emails
app.use((req, res, next) => {
    const origin = req.get("origin");
    // If the origin is in our whitelist, use it as the base for links
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        req.frontendUrl = origin;
    } else {
        // Fallback to .env value or localhost
        req.frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    }
    next();
});

// ── Stripe webhook needs raw body (MUST come before express.json()) ───
app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhookRoutes);

// ── JSON parsing for all other routes ─────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "🏠 Flat Booking System API is running" });
});

app.use("/api/reservations", reservationRoutes);
app.use("/api/reservations", reservationConfirmRoutes);
app.use("/api/reservations-confirmed", reservationsConfirmedRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/daily-rates", dailyRatesRoutes);
app.use("/api/centralni-mozek-stranky", adminAuthRoutes);
app.use("/api/centralni-mozek-stranky", adminStatsRoutes);
app.use("/api/checkin", checkInRoutes);
app.use("/api/blocked-dates", blockedDatesRoutes);
app.use("/api/seasonal-rates", seasonalRatesRoutes);

// ── Swagger Docs ──────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Start server after DB connection ──────────────────────────────────
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
