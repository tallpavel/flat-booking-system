const express = require("express");
const router = express.Router();
const ReservationConfirmed = require("../models/ReservationConfirmed");

// ── GET /api/reservations-confirmed — List all confirmed reservations ─
router.get("/", async (req, res) => {
    try {
        const reservations = await ReservationConfirmed.find().sort({ checkIn: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ── GET /api/reservations-confirmed/:id — Get a single confirmed reservation
router.get("/:id", async (req, res) => {
    try {
        const reservation = await ReservationConfirmed.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: "Confirmed reservation not found" });
        }

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
