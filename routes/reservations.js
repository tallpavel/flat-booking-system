const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

// ── GET /api/reservations — List all reservations ─────────────────────
router.get("/", async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ checkIn: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ── GET /api/reservations/:id — Get a single reservation ──────────────
router.get("/:id", async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ── POST /api/reservations — Create a new reservation ─────────────────
router.post("/", async (req, res) => {
    try {
        const { guestName, guestEmail, checkIn, checkOut } = req.body;

        const reservation = await Reservation.create({
            guestName,
            guestEmail,
            checkIn,
            checkOut,
        });

        res.status(201).json(reservation);
    } catch (error) {
        // Mongoose validation errors return a 400
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ── PUT /api/reservations/:id — Update a reservation ──────────────────
router.put("/:id", async (req, res) => {
    try {
        const { guestName, guestEmail, checkIn, checkOut } = req.body;

        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { guestName, guestEmail, checkIn, checkOut },
            { new: true, runValidators: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json(reservation);
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ── DELETE /api/reservations/:id — Delete a reservation ───────────────
router.delete("/:id", async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json({ message: "Reservation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
