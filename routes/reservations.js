const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const ReservationRequest = require("../models/ReservationRequest");
const BlockedDate = require("../models/BlockedDate");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { getTransporter } = require("../config/mailer");
const { buildBookingRequestEmail } = require("../emails/bookingRequestEmail");
const { buildRejectionEmail } = require("../emails/rejectionEmail");
const { buildOwnerNewRequestEmail } = require("../emails/ownerNewRequestEmail");
const { emailAttachments } = require("../emails/emailLayout");
const { verifyTurnstile } = require("../config/turnstile");
const { calculatePrice } = require("../config/priceCalculator");
const { requireAdmin } = require("../config/authMiddleware");

// ── Rate limiter for reservation creation (5 per IP per 15 min) ──────
const reservationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many reservation requests. Please try again later." },
    keyGenerator: (req) => {
        // Use X-Forwarded-For if behind a proxy (nginx), else req.ip
        return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    },
});

const MIN_NIGHTS = 3;

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
 *     summary: List all reservation requests (admin only)
 *     tags: [Reservation Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reservation requests sorted by check-in date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservationRequest'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.get("/", requireAdmin, async (req, res) => {
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
 *     summary: Get a single reservation request (admin only)
 *     tags: [Reservation Requests]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get("/:id", requireAdmin, async (req, res) => {
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
 *       403:
 *         description: Turnstile verification failed
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.post("/", reservationLimiter, async (req, res) => {
    try {
        const { guestName, guestEmail, guestPhone, checkIn, checkOut, comment, locale, turnstileToken, preferredPaymentMethod } = req.body;

        // ── Turnstile bot protection ──────────────────────────────────
        const turnstileResult = await verifyTurnstile(turnstileToken, req.ip);
        if (!turnstileResult.success) {
            return res.status(403).json({ message: turnstileResult.error });
        }

        // ── Date validation ───────────────────────────────────────────
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: "Invalid check-in or check-out date" });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: "Check-out must be after check-in" });
        }

        // Check-in must not be in the past
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const ciNormalized = new Date(checkInDate);
        ciNormalized.setUTCHours(0, 0, 0, 0);

        if (ciNormalized < today) {
            return res.status(400).json({ message: "Check-in date cannot be in the past" });
        }

        // ── Server-side price & nights calculation (IGNORE client values) ──
        const { nights, totalPrice } = await calculatePrice(checkInDate, checkOutDate);

        if (nights < MIN_NIGHTS) {
            return res.status(400).json({ message: `Minimum stay is ${MIN_NIGHTS} nights` });
        }

        // ── Check for blocked/booked date conflicts ───────────────────
        const blockedConflict = await BlockedDate.findOne({
            date: { $gte: checkInDate, $lt: checkOutDate },
        });
        if (blockedConflict) {
            return res.status(400).json({ message: "Selected dates include unavailable days. Please choose different dates." });
        }

        const bookedConflict = await ReservationConfirmed.findOne({
            status: "active",
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
        });
        if (bookedConflict) {
            return res.status(400).json({ message: "Selected dates overlap with an existing booking. Please choose different dates." });
        }

        // ── Create reservation with SERVER-computed values ────────────
        const reservation = await ReservationRequest.create({
            guestName,
            guestEmail,
            guestPhone: guestPhone || "",
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,        // SERVER-computed
            totalPrice,    // SERVER-computed
            comment: comment || "",
            locale: locale || "en",
            preferredPaymentMethod: preferredPaymentMethod || "stripe",
        });

        res.status(201).json(reservation);

        // ── Send acknowledgment email to guest (fire-and-forget) ─────
        const checkInStr = checkInDate.toISOString().split("T")[0];
        const checkOutStr = checkOutDate.toISOString().split("T")[0];

        try {
            const { subject, html, text } = buildBookingRequestEmail({
                guestName,
                checkInDate: checkInStr,
                checkOutDate: checkOutStr,
                nights,
                totalPrice,
                locale: locale || "en",
            });

            await getTransporter().sendMail({
                from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                to: guestEmail,
                subject,
                html,
                text,
                attachments: emailAttachments,
            });

            console.log(`📨 Booking request acknowledgment sent to ${guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send booking request email:", emailError.message);
        }

        // ── Send notification email to owner (fire-and-forget) ───────
        try {
            const ownerEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
            const { subject, html, text } = buildOwnerNewRequestEmail({
                guestName,
                guestEmail,
                guestPhone: guestPhone || "",
                checkInDate: checkInStr,
                checkOutDate: checkOutStr,
                nights,
                totalPrice,
                comment: comment || "",
                preferredPaymentMethod: preferredPaymentMethod || "stripe",
            });

            await getTransporter().sendMail({
                from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                to: ownerEmail,
                subject,
                html,
                text,
                attachments: emailAttachments,
            });

            console.log(`🔔 Owner notification sent to ${ownerEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send owner notification email:", emailError.message);
        }
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
 *     summary: Update a reservation request (admin only)
 *     tags: [Reservation Requests]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const { guestName, guestEmail, guestPhone, checkIn, checkOut, nights, totalPrice, comment, preferredPaymentMethod } = req.body;

        const reservation = await ReservationRequest.findByIdAndUpdate(
            req.params.id,
            { guestName, guestEmail, guestPhone, checkIn, checkOut, nights, totalPrice, comment: comment || "", preferredPaymentMethod: preferredPaymentMethod || "stripe" },
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

// PATCH — partial update (admin only)
router.patch("/:id", requireAdmin, async (req, res) => {
    try {
        const updates = {};
        const allowedFields = ["guestName", "guestEmail", "guestPhone", "checkIn", "checkOut", "nights", "totalPrice", "comment", "preferredPaymentMethod"];
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
 *     summary: Delete a reservation request (admin only)
 *     tags: [Reservation Requests]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body || {};

        // Find reservation first to get details for the email
        const reservation = await ReservationRequest.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Send rejection email (fire-and-forget)
        try {
            const checkInDate = reservation.checkIn.toISOString().split("T")[0];
            const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

            const { subject, html, text } = buildRejectionEmail({
                guestName: reservation.guestName,
                checkInDate,
                checkOutDate,
                nights: reservation.nights,
                totalPrice: reservation.totalPrice,
                locale: reservation.locale || "en",
                reason: reason || "",
            });

            await getTransporter().sendMail({
                from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                to: reservation.guestEmail,
                subject,
                html,
                text,
                attachments: emailAttachments,
            });

            console.log(`📨 Rejection email sent to ${reservation.guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send rejection email:", emailError.message);
        }

        // Delete the request
        await ReservationRequest.findByIdAndDelete(req.params.id);

        res.json({ message: "Reservation rejected and deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
