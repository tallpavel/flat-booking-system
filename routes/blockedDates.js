const express = require("express");
const router = express.Router();
const BlockedDate = require("../models/BlockedDate");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { requireAdmin } = require("../config/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Blocked Dates
 *   description: Admin-managed calendar day blocking (maintenance, personal use, etc.)
 */

/**
 * @swagger
 * /api/blocked-dates:
 *   get:
 *     summary: Get all blocked dates
 *     description: >
 *       Public endpoint — returns all blocked dates so the booking calendar
 *       can disable them. No authentication required.
 *     tags: [Blocked Dates]
 *     responses:
 *       200:
 *         description: Array of blocked dates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlockedDate'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        // Only return dates from today onwards (no need to show past blocked dates)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const blocked = await BlockedDate.find({
            date: { $gte: today },
        }).sort({ date: 1 });

        res.set("Cache-Control", "no-store");
        res.json(blocked);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/blocked-dates:
 *   post:
 *     summary: Block a specific date
 *     description: >
 *       Admin-only. Blocks a date on the booking calendar.
 *       Rejects if the date is already covered by a confirmed reservation.
 *       If the date is already blocked, updates the reason.
 *     tags: [Blocked Dates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-15"
 *               reason:
 *                 type: string
 *                 example: "Maintenance"
 *     responses:
 *       200:
 *         description: Date blocked successfully (or already blocked)
 *       400:
 *         description: Missing required date field
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Date is already booked by a confirmed reservation
 *       500:
 *         description: Server error
 */
router.post("/", requireAdmin, async (req, res) => {
    try {
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ message: "'date' is required" });
        }

        // Normalise to midnight UTC to avoid timezone duplicates
        const normalizedDate = new Date(date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        // ── Validate: reject if covered by an active confirmed reservation ──
        // A date is "booked" if it falls within checkIn <= date < checkOut
        const conflicting = await ReservationConfirmed.findOne({
            status: "active",
            checkIn: { $lte: normalizedDate },
            checkOut: { $gt: normalizedDate },
        });

        if (conflicting) {
            const dateStr = normalizedDate.toISOString().split("T")[0];
            const ciStr = conflicting.checkIn.toISOString().split("T")[0];
            const coStr = conflicting.checkOut.toISOString().split("T")[0];
            return res.status(409).json({
                message: `Cannot block ${dateStr} — already booked by ${conflicting.guestName} (${ciStr} → ${coStr})`,
            });
        }

        // Upsert: update reason if already blocked, create if not
        const blocked = await BlockedDate.findOneAndUpdate(
            { date: normalizedDate },
            { reason: reason || "" },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(blocked);
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
 * /api/blocked-dates/{id}:
 *   delete:
 *     summary: Unblock a specific date
 *     description: Admin-only. Removes a blocked date, making it available for booking again.
 *     tags: [Blocked Dates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: BlockedDate MongoDB ID
 *     responses:
 *       200:
 *         description: Date unblocked successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Blocked date not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const blocked = await BlockedDate.findByIdAndDelete(req.params.id);

        if (!blocked) {
            return res.status(404).json({ message: "Blocked date not found" });
        }

        res.json({ message: "Date unblocked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
