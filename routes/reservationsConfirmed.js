const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { requireAdmin } = require("../config/authMiddleware");
const { getTransporter } = require("../config/mailer");
const { buildUpdateEmail } = require("../emails/updateEmail");
const { buildCancellationEmail } = require("../emails/cancellationEmail");
const { buildRemainingBalanceEmail } = require("../emails/remainingBalanceEmail");
const { buildFullPaymentEmail } = require("../emails/fullPaymentEmail");
const { emailAttachments } = require("../emails/emailLayout");

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
        // Only return active reservations (backward-compatible: old records without status are active)
        const reservations = await ReservationConfirmed.find({
            $or: [{ status: "active" }, { status: { $exists: false } }],
        }).sort({ checkIn: 1 });
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

/**
 * PATCH /api/reservations-confirmed/:id/checkin
 * Toggle checked-in status (admin-only).
 */
router.patch("/:id/checkin", requireAdmin, async (req, res) => {
    try {
        const reservation = await ReservationConfirmed.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: "Confirmed reservation not found" });
        }

        const nowCheckedIn = !reservation.checkedIn;
        reservation.checkedIn = nowCheckedIn;
        reservation.checkedInAt = nowCheckedIn ? new Date() : null;
        await reservation.save();

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * DELETE /api/reservations-confirmed/:id
 * Cancel (delete) a confirmed reservation (admin-only).
 */
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        // Soft-delete: set status to cancelled instead of removing
        const reservation = await ReservationConfirmed.findByIdAndUpdate(
            req.params.id,
            { status: "cancelled", cancelledAt: new Date() },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: "Confirmed reservation not found" });
        }

        // Send cancellation email (fire-and-forget)
        try {
            const checkInDate = reservation.checkIn.toISOString().split("T")[0];
            const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

            const { subject, html, text } = buildCancellationEmail({
                guestName: reservation.guestName,
                checkInDate,
                checkOutDate,
                nights: reservation.nights,
                totalPrice: reservation.totalPrice,
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

            console.log(`📧 Cancellation email sent to ${reservation.guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send cancellation email:", emailError.message);
        }

        res.json({ message: "Confirmed reservation cancelled successfully", emailSent: true });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
/**
 * PATCH /api/reservations-confirmed/:id
 * Update a confirmed reservation (admin-only).
 * Validates that new dates don't overlap with other confirmed reservations.
 */
router.patch("/:id", requireAdmin, async (req, res) => {
    try {
        const updates = {};
        const allowedFields = ["guestName", "guestEmail", "checkIn", "checkOut", "nights", "totalPrice", "comment"];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Fetch current reservation for comparison (needed for email + date validation)
        const current = await ReservationConfirmed.findById(req.params.id);
        if (!current) {
            return res.status(404).json({ message: "Confirmed reservation not found" });
        }

        // If dates are changing, validate no overlap with other confirmed reservations
        if (updates.checkIn || updates.checkOut) {
            const newCheckIn = new Date(updates.checkIn || current.checkIn);
            const newCheckOut = new Date(updates.checkOut || current.checkOut);

            // Validate checkOut > checkIn
            if (newCheckOut <= newCheckIn) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: ["Check-out date must be after the check-in date"],
                });
            }

            // Find any overlapping confirmed reservations (excluding this one)
            const overlapping = await ReservationConfirmed.find({
                _id: { $ne: req.params.id },
                checkIn: { $lt: newCheckOut },
                checkOut: { $gt: newCheckIn },
            });

            if (overlapping.length > 0) {
                const conflictDetails = overlapping.map(
                    (r) => `${r.guestName} (${r.checkIn.toISOString().split("T")[0]} – ${r.checkOut.toISOString().split("T")[0]})`
                );
                return res.status(409).json({
                    message: "Date conflict with existing confirmed reservations",
                    errors: conflictDetails,
                });
            }
        }

        // Recalculate deposit if totalPrice changes
        if (updates.totalPrice) {
            updates.depositAmount = Math.round(updates.totalPrice * 0.3);
        }

        // Build changes list for the email (before applying updates)
        const changes = [];
        const fieldLabels = {
            guestName: "Guest Name", guestEmail: "Email",
            checkIn: "Check-in", checkOut: "Check-out",
            nights: "Nights", totalPrice: "Total Price", comment: "Comment",
        };
        for (const field of allowedFields) {
            if (updates[field] === undefined) continue;
            let oldVal = current[field];
            let newVal = updates[field];
            // Format dates for display
            if (field === "checkIn" || field === "checkOut") {
                oldVal = oldVal instanceof Date ? oldVal.toISOString().split("T")[0] : String(oldVal);
                newVal = new Date(newVal).toISOString().split("T")[0];
            } else if (field === "totalPrice") {
                oldVal = `€${oldVal}`;
                newVal = `€${newVal}`;
            } else {
                oldVal = String(oldVal || "(empty)");
                newVal = String(newVal || "(empty)");
            }
            if (oldVal !== newVal) {
                changes.push({ field: fieldLabels[field] || field, from: oldVal, to: newVal });
            }
        }

        const reservation = await ReservationConfirmed.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: "Confirmed reservation not found" });
        }

        // Send update notification email (fire-and-forget)
        let emailSent = false;
        if (changes.length > 0) {
            try {
                const checkInDate = reservation.checkIn.toISOString().split("T")[0];
                const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

                const { subject, html, text } = buildUpdateEmail({
                    guestName: reservation.guestName,
                    changes,
                    checkInDate,
                    checkOutDate,
                    nights: reservation.nights,
                    totalPrice: reservation.totalPrice,
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

                emailSent = true;
                console.log(`📧 Update email sent to ${reservation.guestEmail}`);
            } catch (emailError) {
                console.error("⚠️ Failed to send update email:", emailError.message);
            }
        }

        res.json({ ...reservation.toJSON(), emailSent });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * GET /api/reservations-confirmed/archived
 * Returns cancelled and completed reservations.
 * Also auto-marks past active reservations as completed.
 */
router.get("/archived/list", requireAdmin, async (req, res) => {
    try {
        const now = new Date();

        // Auto-complete: mark active reservations whose checkout is in the past
        await ReservationConfirmed.updateMany(
            {
                $or: [{ status: "active" }, { status: { $exists: false } }],
                checkOut: { $lt: now },
            },
            { status: "completed" }
        );

        // Fetch all non-active reservations
        const archived = await ReservationConfirmed.find({
            status: { $in: ["cancelled", "completed"] },
        }).sort({ updatedAt: -1 });

        res.json(archived);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * POST /:id/send-remaining-payment
 * Creates a Stripe Checkout session for the remaining balance and sends payment email to guest.
 */
router.post("/:id/send-remaining-payment", requireAdmin, async (req, res) => {
    try {
        const reservation = await ReservationConfirmed.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.paymentStatus !== "paid") {
            return res.status(400).json({ message: "Deposit must be paid first" });
        }

        if (reservation.remainingPaymentStatus === "paid") {
            return res.status(400).json({ message: "Remaining balance already paid" });
        }

        const remainingBalance = reservation.totalPrice - reservation.depositAmount;
        if (remainingBalance <= 0) {
            return res.status(400).json({ message: "No remaining balance" });
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const checkInDate = reservation.checkIn.toISOString().split("T")[0];
        const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

        // Create Stripe Checkout session for remaining balance
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: reservation.guestEmail,
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Paraíso — Remaining Balance for ${reservation.nights}-night stay`,
                            description: `${checkInDate} → ${checkOutDate} · Total: €${reservation.totalPrice} · Deposit paid: €${reservation.depositAmount}`,
                        },
                        unit_amount: remainingBalance * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                reservationId: reservation._id.toString(),
                guestName: reservation.guestName,
                paymentType: "remaining_balance",
                checkIn: checkInDate,
                checkOut: checkOutDate,
            },
            success_url: `${frontendUrl}/payment?payment=success&type=remaining`,
            cancel_url: `${frontendUrl}/payment?payment=cancelled&type=remaining`,
        });

        // Update reservation with remaining payment session info
        reservation.remainingStripeSessionId = session.id;
        reservation.remainingPaymentUrl = session.url;
        reservation.remainingPaymentStatus = "pending";
        await reservation.save();

        // Send remaining balance email to guest
        try {
            const { subject, html, text } = buildRemainingBalanceEmail({
                guestName: reservation.guestName,
                checkInDate,
                checkOutDate,
                nights: reservation.nights,
                totalPrice: reservation.totalPrice,
                depositAmount: reservation.depositAmount,
                remainingBalance,
                paymentUrl: session.url,
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

            console.log(`💳 Remaining balance email sent to ${reservation.guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send remaining balance email:", emailError.message);
        }

        res.json({
            message: "Remaining balance payment link created and email sent",
            paymentUrl: session.url,
            remainingBalance,
        });
    } catch (error) {
        console.error("Error creating remaining payment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * POST /:id/send-full-payment
 * For last-minute bookings (<14 days). Creates a Stripe Checkout session for the
 * full amount and sends a full payment email to the guest.
 */
router.post("/:id/send-full-payment", requireAdmin, async (req, res) => {
    try {
        const reservation = await ReservationConfirmed.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Block if already fully paid
        if (reservation.paymentStatus === "paid" && reservation.remainingPaymentStatus === "paid") {
            return res.status(400).json({ message: "Reservation is already fully paid" });
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const checkInDate = reservation.checkIn.toISOString().split("T")[0];
        const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

        // Create Stripe Checkout session for the FULL amount
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: reservation.guestEmail,
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Paraíso — Full Payment for ${reservation.nights}-night stay`,
                            description: `${checkInDate} → ${checkOutDate} · Total: €${reservation.totalPrice} (Last-minute booking — full payment required)`,
                        },
                        unit_amount: reservation.totalPrice * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                reservationId: reservation._id.toString(),
                guestName: reservation.guestName,
                paymentType: "full_payment",
                checkIn: checkInDate,
                checkOut: checkOutDate,
            },
            success_url: `${frontendUrl}/payment?payment=success&type=full`,
            cancel_url: `${frontendUrl}/payment?payment=cancelled&type=full`,
        });

        // Store session info in the remaining payment fields
        reservation.remainingStripeSessionId = session.id;
        reservation.remainingPaymentUrl = session.url;
        reservation.remainingPaymentStatus = "pending";
        await reservation.save();

        // Send full payment email
        try {
            const { subject, html, text } = buildFullPaymentEmail({
                guestName: reservation.guestName,
                checkInDate,
                checkOutDate,
                nights: reservation.nights,
                totalPrice: reservation.totalPrice,
                paymentUrl: session.url,
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

            console.log(`💳 Full payment email sent to ${reservation.guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send full payment email:", emailError.message);
        }

        res.json({
            message: "Full payment link created and email sent",
            paymentUrl: session.url,
            totalAmount: reservation.totalPrice,
        });
    } catch (error) {
        console.error("Error creating full payment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

const { buildAccessInfoEmail } = require("../emails/accessInfoEmail");

/* ─── Send Access Information Email ─────────────────────────────── */
router.post("/:id/send-access-info", requireAdmin, async (req, res) => {
    try {
        const reservation = await ReservationConfirmed.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.checkInStatus !== "completed") {
            return res.status(400).json({ message: "Check-in must be completed before sending access info" });
        }

        const checkInDate = reservation.checkIn.toISOString().split("T")[0];
        const checkOutDate = reservation.checkOut.toISOString().split("T")[0];

        const { subject, html, text } = buildAccessInfoEmail({
            guestName: reservation.guestName,
            checkInDate,
            checkOutDate,
            nights: reservation.nights,
            locale: reservation.locale || "en",
        });

        const transporter = getTransporter();
        try {
            await transporter.sendMail({
                from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                to: reservation.guestEmail,
                subject,
                html,
                text,
                attachments: emailAttachments,
            });
            console.log(`✅ Access info email sent to ${reservation.guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send access info email:", emailError.message);
            return res.status(500).json({ message: "Failed to send email", error: emailError.message });
        }

        reservation.accessInfoSent = true;
        await reservation.save();

        res.json({ message: "Access information email sent successfully" });
    } catch (error) {
        console.error("Error sending access info:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
