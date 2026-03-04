const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectDB = require("./config/db");
const reservationRoutes = require("./routes/reservations");
const reservationsConfirmedRoutes = require("./routes/reservationsConfirmed");
const contactRoutes = require("./routes/contact");
const dailyRatesRoutes = require("./routes/dailyRates");

// ── Load environment variables ────────────────────────────────────────
require("dotenv").config();

// ── Initialise Express ────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        "http://localhost:5173",  // Vite dev server (paraiso-booking-app)
        "http://localhost:4173",  // Vite preview
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "🏠 Flat Booking System API is running" });
});

app.use("/api/reservations", reservationRoutes);
app.use("/api/reservations-confirmed", reservationsConfirmedRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/daily-rates", dailyRatesRoutes);

// ── Swagger Docs ──────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Start server after DB connection ──────────────────────────────────
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
