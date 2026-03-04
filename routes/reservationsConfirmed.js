const express = require("express");
const router = express.Router();
const ReservationConfirmed = require("../models/ReservationConfirmed");

/**
 * @swagger
 * tags:
 *   name: Confirmed Reservations
 *   description: Read-only endpoints for confirmed bookings
 */

/**
 * @swagger
 * /api/reservations-confirmed:
 *   get:
 *     summary: List all confirmed reservations
 *     tags: [Confirmed Reservations]
 *     responses:
 *       200:
 *         description: A list of confirmed reservations sorted by check-in date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservationConfirmed'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.get("/", async (req, res) => {
    try {
        const reservations = await ReservationConfirmed.find().sort({ checkIn: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/reservations-confirmed/{id}:
 *   get:
 *     summary: Get a single confirmed reservation
 *     tags: [Confirmed Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Confirmed reservation MongoDB ID
 *     responses:
 *       200:
 *         description: The confirmed reservation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationConfirmed'
 *       404:
 *         description: Confirmed reservation not found
 *       500:
 *         description: Server error
 */
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
