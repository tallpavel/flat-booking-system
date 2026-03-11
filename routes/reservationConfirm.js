const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ReservationRequest = require("../models/ReservationRequest");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { getTransporter } = require("../config/mailer");
const { buildConfirmationEmail } = require("../emails/confirmationEmail");

const DEPOSIT_PERCENTAGE = 0.3; // 30% deposit

/**
 * @swagger
 * tags:
 *   name: Reservation Confirmation
 *   description: Owner confirms a request → creates Stripe payment link
 */

/**
 * @swagger
 * /api/reservations/{id}/confirm:
 *   post:
 *     summary: Confirm a reservation request and generate a Stripe deposit payment link
 *     tags: [Reservation Confirmation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation Request MongoDB ID
 *     responses:
 *       201:
 *         description: Reservation confirmed with Stripe payment link and email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reservation confirmed — payment link generated & email sent
 *                 confirmed:
 *                   $ref: '#/components/schemas/ReservationConfirmed'
 *                 paymentUrl:
 *                   type: string
 *                   description: Stripe Checkout URL to send to the guest
 *                   example: https://checkout.stripe.com/c/pay/cs_test_...
 *                 emailSent:
 *                   type: boolean
 *                   description: Whether the payment email was sent successfully
 *       404:
 *         description: Reservation request not found
 *       500:
 *         description: Server error
 */
router.post("/:id/confirm", async (req, res) => {
    try {
        // 1. Find the original request
        const request = await ReservationRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Reservation request not found" });
        }

        // 2. Calculate deposit
        const depositAmount = Math.round(request.totalPrice * DEPOSIT_PERCENTAGE);

        // 3. Create Stripe Checkout Session
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: request.guestEmail,
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Paraíso — Deposit for ${request.nights}-night stay`,
                            description: `${request.checkIn.toISOString().split("T")[0]} → ${request.checkOut.toISOString().split("T")[0]} · Total: €${request.totalPrice} · Deposit: 30%`,
                        },
                        unit_amount: depositAmount * 100, // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                reservationId: request._id.toString(),
                guestName: request.guestName,
                checkIn: request.checkIn.toISOString().split("T")[0],
                checkOut: request.checkOut.toISOString().split("T")[0],
            },
            success_url: `${frontendUrl}?payment=success`,
            cancel_url: `${frontendUrl}?payment=cancelled`,
        });

        // 4. Create the confirmed reservation
        const confirmed = await ReservationConfirmed.create({
            guestName: request.guestName,
            guestEmail: request.guestEmail,
            guestPhone: request.guestPhone || "",
            checkIn: request.checkIn,
            checkOut: request.checkOut,
            nights: request.nights,
            totalPrice: request.totalPrice,
            depositAmount,
            comment: request.comment || "",
            paymentStatus: "pending",
            stripeSessionId: session.id,
            stripePaymentUrl: session.url,
        });

        // 5. Remove the original request
        await ReservationRequest.findByIdAndDelete(req.params.id);

        // 6. Send multilingual payment email to the guest
        const checkInDate = request.checkIn.toISOString().split("T")[0];
        const checkOutDate = request.checkOut.toISOString().split("T")[0];
        const remainingBalance = request.totalPrice - depositAmount;
        let emailSent = false;

        try {
            const { subject, html, text } = buildConfirmationEmail({
                guestName: request.guestName,
                checkInDate,
                checkOutDate,
                nights: request.nights,
                totalPrice: request.totalPrice,
                depositAmount,
                remainingBalance,
                paymentUrl: session.url,
            });

            await getTransporter().sendMail({
                from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                to: request.guestEmail,
                subject,
                html,
                text,
            });

            emailSent = true;
            console.log(`📧 Payment email sent to ${request.guestEmail}`);
        } catch (emailError) {
            console.error("⚠️ Failed to send payment email:", emailError.message);
            // Don't fail the whole request if the email fails
        }

        res.status(201).json({
            message: emailSent
                ? "Reservation confirmed — payment link generated & email sent"
                : "Reservation confirmed — payment link generated (email failed)",
            confirmed,
            paymentUrl: session.url,
            emailSent,
        });
    } catch (error) {
        console.error("Confirm error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
