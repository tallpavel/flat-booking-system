const express = require("express");
const router = express.Router();
const ReservationRequest = require("../models/ReservationRequest");

/**
 * @swagger
 * tags:
 *   name: Reservation Requests
 *   description: CRUD operations for flat reservation requests
 */

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: List all reservation requests
 *     tags: [Reservation Requests]
 *     responses:
 *       200:
 *         description: A list of reservation requests sorted by check-in date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservationRequest'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.get("/", async (req, res) => {
    try {
        const reservations = await ReservationRequest.find().sort({ checkIn: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Get a single reservation request
 *     tags: [Reservation Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation MongoDB ID
 *     responses:
 *       200:
 *         description: The reservation request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationRequest'
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
    try {
        const reservation = await ReservationRequest.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new reservation request
 *     tags: [Reservation Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationInput'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationRequest'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
    try {
        const { guestName, guestEmail, checkIn, checkOut, nights, totalPrice, comment } = req.body;

        const reservation = await ReservationRequest.create({
            guestName,
            guestEmail,
            checkIn,
            checkOut,
            nights,
            totalPrice,
            comment: comment || "",
        });

        res.status(201).json(reservation);
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Update a reservation request
 *     tags: [Reservation Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationInput'
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationRequest'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
    try {
        const { guestName, guestEmail, checkIn, checkOut, nights, totalPrice, comment } = req.body;

        const reservation = await ReservationRequest.findByIdAndUpdate(
            req.params.id,
            { guestName, guestEmail, checkIn, checkOut, nights, totalPrice, comment: comment || "" },
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

// PATCH — partial update (same logic as PUT)
router.patch("/:id", async (req, res) => {
    try {
        const updates = {};
        const allowedFields = ["guestName", "guestEmail", "checkIn", "checkOut", "nights", "totalPrice", "comment"];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const reservation = await ReservationRequest.findByIdAndUpdate(
            req.params.id,
            updates,
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

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Delete a reservation request
 *     tags: [Reservation Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation MongoDB ID
 *     responses:
 *       200:
 *         description: Reservation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reservation deleted successfully
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
    try {
        const reservation = await ReservationRequest.findByIdAndDelete(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json({ message: "Reservation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
