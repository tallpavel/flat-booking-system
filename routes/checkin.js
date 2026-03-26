const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const CheckInData = require("../models/CheckInData");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { requireAdmin } = require("../config/authMiddleware");
const { getTransporter } = require("../config/mailer");
const { buildCheckInRequestEmail } = require("../emails/checkInRequestEmail");
const { emailAttachments } = require("../emails/emailLayout");
const { verifyTurnstile } = require("../config/turnstile");

/**
 * POST /api/checkin/send/:reservationId
 * Admin-only: Generate a check-in token and send the check-in email to the guest.
 */
router.post("/send/:reservationId", requireAdmin, async (req, res) => {
    try {
        const reservation = await ReservationConfirmed.findById(req.params.reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Check if a token already exists for this reservation
        let checkInRecord = await CheckInData.findOne({ reservationId: reservation._id });

        if (!checkInRecord) {
            // Generate a secure token
            const token = crypto.randomBytes(32).toString("hex");

            checkInRecord = await CheckInData.create({
                reservationId: reservation._id,
                token,
                guestName: reservation.guestName,
                guestEmail: reservation.guestEmail,
                checkIn: reservation.checkIn,
                checkOut: reservation.checkOut,
                guests: [],
            });
        }

        // Update reservation check-in status
        reservation.checkInStatus = "sent";
        reservation.checkInToken = checkInRecord.token;
        await reservation.save();

        // Build and send the email
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const checkInUrl = `${frontendUrl}/checkin/${checkInRecord.token}`;

        const checkInDate = reservation.checkIn.toISOString().split("T")[0];
        const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

        const { subject, html, text } = buildCheckInRequestEmail({
            guestName: reservation.guestName,
            checkInDate,
            checkOutDate,
            nights: reservation.nights,
            checkInUrl,
            locale: reservation.locale || "en",
        });

        await getTransporter().sendMail({
            from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
            to: reservation.guestEmail,
            subject,
            html,
            text,
            attachments: emailAttachments,
        });

        console.log(`📋 Check-in email sent to ${reservation.guestEmail}`);

        res.json({
            message: "Check-in email sent successfully",
            token: checkInRecord.token,
            checkInUrl,
        });
    } catch (error) {
        console.error("Failed to send check-in email:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * GET /api/checkin/reservation/:reservationId
 * Admin-only: Fetch check-in data for a specific reservation.
 */
router.get("/reservation/:reservationId", requireAdmin, async (req, res) => {
    try {
        const checkInRecord = await CheckInData.findOne({ reservationId: req.params.reservationId });
        if (!checkInRecord) {
            return res.status(404).json({ message: "No check-in data found for this reservation" });
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        res.json({
            guestName: checkInRecord.guestName,
            guestEmail: checkInRecord.guestEmail,
            checkIn: checkInRecord.checkIn,
            checkOut: checkInRecord.checkOut,
            guests: checkInRecord.guests,
            submittedAt: checkInRecord.submittedAt,
            checkInUrl: `${frontendUrl}/checkin/${checkInRecord.token}`,
            updatedAt: checkInRecord.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * GET /api/checkin/:token
 * Public: Fetch check-in data for a given token (guest accesses this).
 */
router.get("/:token", async (req, res) => {
    try {
        const checkInRecord = await CheckInData.findOne({ token: req.params.token });
        if (!checkInRecord) {
            return res.status(404).json({ message: "Check-in link not found or expired" });
        }

        res.json({
            guestName: checkInRecord.guestName,
            guestEmail: checkInRecord.guestEmail,
            checkIn: checkInRecord.checkIn,
            checkOut: checkInRecord.checkOut,
            guests: checkInRecord.guests,
            submittedAt: checkInRecord.submittedAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * POST /api/checkin/:token
 * Public: Submit or update check-in guest data.
 * Protected by Turnstile token validation.
 */
router.post("/:token", async (req, res) => {
    try {
        const { guests, turnstileToken } = req.body;

        // ── Turnstile bot protection ──────────────────────────────────
        const turnstileResult = await verifyTurnstile(turnstileToken, req.ip);
        if (!turnstileResult.success) {
            return res.status(403).json({ message: turnstileResult.error });
        }

        // ── Validate guests array ─────────────────────────────────────
        if (!Array.isArray(guests) || guests.length === 0) {
            return res.status(400).json({ message: "At least one guest is required" });
        }

        const validDocTypes = ["passport", "id_card", "driving_license"];
        const errors = [];

        guests.forEach((g, i) => {
            const prefix = `Guest ${i + 1}`;
            if (!g.fullName || g.fullName.trim().length < 2) {
                errors.push(`${prefix}: Full name is required (min 2 characters)`);
            }
            if (!g.dateOfBirth) {
                errors.push(`${prefix}: Date of birth is required`);
            } else {
                const dob = new Date(g.dateOfBirth);
                const now = new Date();
                if (isNaN(dob.getTime()) || dob > now) {
                    errors.push(`${prefix}: Invalid date of birth`);
                }
            }
            if (!g.nationality || g.nationality.trim().length < 2) {
                errors.push(`${prefix}: Nationality is required`);
            }
            if (!validDocTypes.includes(g.documentType)) {
                errors.push(`${prefix}: Document type must be passport, id_card, or driving_license`);
            }
            if (!g.documentNumber || g.documentNumber.trim().length < 3) {
                errors.push(`${prefix}: Document number is required (min 3 characters)`);
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }

        // ── Find and update the check-in record ──────────────────────
        const checkInRecord = await CheckInData.findOne({ token: req.params.token });
        if (!checkInRecord) {
            return res.status(404).json({ message: "Check-in link not found or expired" });
        }

        checkInRecord.guests = guests.map(g => ({
            fullName: g.fullName.trim(),
            dateOfBirth: g.dateOfBirth,
            nationality: g.nationality.trim(),
            documentType: g.documentType,
            documentNumber: g.documentNumber.trim(),
        }));
        checkInRecord.submittedAt = new Date();
        await checkInRecord.save();

        // ── Update the reservation status ─────────────────────────────
        await ReservationConfirmed.findByIdAndUpdate(checkInRecord.reservationId, {
            checkedIn: true,
            checkedInAt: new Date(),
            checkInStatus: "completed",
        });

        res.json({
            message: "Check-in data saved successfully",
            guests: checkInRecord.guests,
            submittedAt: checkInRecord.submittedAt,
        });
    } catch (error) {
        console.error("Check-in submission error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
