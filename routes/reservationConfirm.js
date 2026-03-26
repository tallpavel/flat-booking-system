const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ReservationRequest = require("../models/ReservationRequest");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { getTransporter } = require("../config/mailer");
const { buildConfirmationEmail } = require("../emails/confirmationEmail");
const { buildFullPaymentEmail } = require("../emails/fullPaymentEmail");
const { emailAttachments } = require("../emails/emailLayout");

const DEPOSIT_PERCENTAGE = 0.3; // 30% deposit
const SHORT_NOTICE_DAYS = 14;   // Full payment threshold

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

        // 2. Detect short-notice booking (<14 days to check-in)
        const checkInDate = new Date(request.checkIn);
        const now = new Date();
        const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isShortNotice = daysUntilCheckIn < SHORT_NOTICE_DAYS;

        // 3. Calculate amounts based on booking type
        const depositAmount = isShortNotice
            ? request.totalPrice  // Full amount for short-notice
            : Math.round(request.totalPrice * DEPOSIT_PERCENTAGE);
        const chargeAmount = isShortNotice ? request.totalPrice : depositAmount;

        // 4. Create Stripe Checkout Session
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const checkInStr = request.checkIn.toISOString().split("T")[0];
        const checkOutStr = request.checkOut.toISOString().split("T")[0];

        const sessionConfig = {
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: request.guestEmail,
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: isShortNotice
                            ? {
                                name: `Paraíso — Full Payment for ${request.nights}-night stay`,
                                description: `${checkInStr} → ${checkOutStr} · Total: €${request.totalPrice} (Last-minute booking — full payment required)`,
                            }
                            : {
                                name: `Paraíso — Deposit for ${request.nights}-night stay`,
                                description: `${checkInStr} → ${checkOutStr} · Total: €${request.totalPrice} · Deposit: 30%`,
                            },
                        unit_amount: chargeAmount * 100, // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                reservationId: request._id.toString(),
                guestName: request.guestName,
                paymentType: isShortNotice ? "full_payment" : "deposit",
                checkIn: checkInStr,
                checkOut: checkOutStr,
            },
            success_url: isShortNotice
                ? `${frontendUrl}/payment?payment=success&type=full`
                : `${frontendUrl}/payment?payment=success`,
            cancel_url: isShortNotice
                ? `${frontendUrl}/payment?payment=cancelled&type=full`
                : `${frontendUrl}/payment?payment=cancelled`,
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // 5. Create the confirmed reservation
        const confirmedData = {
            guestName: request.guestName,
            guestEmail: request.guestEmail,
            guestPhone: request.guestPhone || "",
            checkIn: request.checkIn,
            checkOut: request.checkOut,
            nights: request.nights,
            totalPrice: request.totalPrice,
            depositAmount: isShortNotice ? request.totalPrice : depositAmount,
            comment: request.comment || "",
            paymentStatus: "pending",
            stripeSessionId: isShortNotice ? "" : session.id,
            stripePaymentUrl: isShortNotice ? "" : session.url,
            locale: request.locale || "en",
        };

        // For short-notice, store session in remaining fields (webhook uses these for full_payment)
        if (isShortNotice) {
            confirmedData.remainingStripeSessionId = session.id;
            confirmedData.remainingPaymentUrl = session.url;
            confirmedData.remainingPaymentStatus = "pending";
        }

        const confirmed = await ReservationConfirmed.create(confirmedData);

        // 6. Remove the original request
        await ReservationRequest.findByIdAndDelete(req.params.id);

        // 7. Send appropriate email
        let emailSent = false;

        try {
            let emailData;

            if (isShortNotice) {
                // Full payment email for short-notice bookings
                emailData = buildFullPaymentEmail({
                    guestName: request.guestName,
                    checkInDate: checkInStr,
                    checkOutDate: checkOutStr,
                    nights: request.nights,
                    totalPrice: request.totalPrice,
                    paymentUrl: session.url,
                    locale: request.locale || "en",
                });
                console.log(`📧 Full payment email sent to ${request.guestEmail} (short-notice)`);
            } else {
                // Standard deposit email
                const remainingBalance = request.totalPrice - depositAmount;
                emailData = buildConfirmationEmail({
                    guestName: request.guestName,
                    checkInDate: checkInStr,
                    checkOutDate: checkOutStr,
                    nights: request.nights,
                    totalPrice: request.totalPrice,
                    depositAmount,
                    remainingBalance,
                    paymentUrl: session.url,
                    locale: request.locale || "en",
                });
                console.log(`📧 Deposit payment email sent to ${request.guestEmail}`);
            }

            await getTransporter().sendMail({
                from: `"Paraíso — Verónica's Flat" <${process.env.EMAIL_USER}>`,
                to: request.guestEmail,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
                attachments: emailAttachments,
            });

            emailSent = true;
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
            isShortNotice,
        });
    } catch (error) {
        console.error("Confirm error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
