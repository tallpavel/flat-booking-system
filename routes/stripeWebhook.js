const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { getTransporter } = require("../config/mailer");
const { buildDepositPaidEmail } = require("../emails/depositPaidEmail");

/**
 * @swagger
 * tags:
 *   name: Stripe Webhooks
 *   description: Stripe event handlers (called by Stripe, not by the frontend)
 */

/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Stripe Webhooks]
 *     description: >
 *       Called by Stripe when a payment event occurs.
 *       Requires raw request body for signature verification.
 *       Do NOT call this endpoint manually.
 *     responses:
 *       200:
 *         description: Event processed successfully
 *       400:
 *         description: Invalid Stripe signature
 */
router.post("/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify the event using Stripe's signature
        // req.body must be the raw Buffer (not JSON-parsed)
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error("⚠️  Stripe webhook signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            console.log(`✅ Payment succeeded for session: ${session.id}`);

            try {
                const updated = await ReservationConfirmed.findOneAndUpdate(
                    { stripeSessionId: session.id },
                    { paymentStatus: "paid" },
                    { new: true }
                );

                if (updated) {
                    console.log(`💰 Reservation ${updated._id} marked as paid (${updated.guestName})`);

                    // Send deposit-paid confirmation email (fire-and-forget)
                    try {
                        const checkInDate = updated.checkIn instanceof Date
                            ? updated.checkIn.toISOString().split("T")[0]
                            : String(updated.checkIn).slice(0, 10);
                        const checkOutDate = updated.checkOut instanceof Date
                            ? updated.checkOut.toISOString().split("T")[0]
                            : String(updated.checkOut).slice(0, 10);
                        const remainingBalance = updated.totalPrice - updated.depositAmount;

                        const { subject, html, text } = buildDepositPaidEmail({
                            guestName: updated.guestName,
                            checkInDate,
                            checkOutDate,
                            nights: updated.nights,
                            totalPrice: updated.totalPrice,
                            depositAmount: updated.depositAmount,
                            remainingBalance,
                        });

                        await getTransporter().sendMail({
                            from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                            to: updated.guestEmail,
                            subject,
                            html,
                            text,
                        });

                        console.log(`📧 Deposit-paid confirmation email sent to ${updated.guestEmail}`);
                    } catch (emailErr) {
                        console.error("⚠️ Failed to send deposit-paid email:", emailErr.message);
                    }
                } else {
                    console.warn(`⚠️  No reservation found for session ${session.id}`);
                }
            } catch (dbErr) {
                console.error("DB update error:", dbErr);
            }
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object;
            console.log(`⏰ Payment session expired: ${session.id}`);

            try {
                await ReservationConfirmed.findOneAndUpdate(
                    { stripeSessionId: session.id },
                    { paymentStatus: "failed" }
                );
            } catch (dbErr) {
                console.error("DB update error:", dbErr);
            }
            break;
        }

        default:
            console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of the event
    res.json({ received: true });
});

module.exports = router;

