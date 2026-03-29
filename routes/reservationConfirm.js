const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ReservationRequest = require("../models/ReservationRequest");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { getTransporter } = require("../config/mailer");
const { buildConfirmationEmail } = require("../emails/confirmationEmail");
const { buildFullPaymentEmail } = require("../emails/fullPaymentEmail");
const { buildPaypalConfirmationEmail } = require("../emails/paypalConfirmationEmail");
const { buildPaypalFullPaymentEmail } = require("../emails/paypalFullPaymentEmail");
const { emailAttachments } = require("../emails/emailLayout");
const { requireAdmin } = require("../config/authMiddleware");

const DEPOSIT_PERCENTAGE = 0.3; // 30% deposit
const SHORT_NOTICE_DAYS = 14;   // Full payment threshold

/**
 * @swagger
 * tags:
 *   name: Reservation Confirmation
 *   description: Owner confirms a request → creates Stripe or PayPal payment link
 */

/**
 * @swagger
 * /api/reservations/{id}/confirm:
 *   post:
 *     summary: Confirm a reservation request and generate a payment link (Stripe or PayPal)
 *     tags: [Reservation Confirmation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation Request MongoDB ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [stripe, paypal]
 *                 description: Payment method to use (defaults to guest preference or stripe)
 *     responses:
 *       201:
 *         description: Reservation confirmed with payment link and email sent
 *       404:
 *         description: Reservation request not found
 *       500:
 *         description: Server error
 */
router.post("/:id/confirm", requireAdmin, async (req, res) => {
    try {
        // 1. Find the original request
        const request = await ReservationRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Reservation request not found" });
        }

        // Determine payment method: body param > guest preference > default stripe
        const paymentMethod = req.body?.paymentMethod || request.preferredPaymentMethod || "stripe";
        const usePaypal = paymentMethod === "paypal";

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

        const checkInStr = request.checkIn.toISOString().split("T")[0];
        const checkOutStr = request.checkOut.toISOString().split("T")[0];
        const frontendUrl = req.frontendUrl;

        let paymentUrl = "";
        let stripeSessionId = "";
        let stripePaymentUrl = "";
        let paypalPaymentUrl = "";
        let remainingStripeSessionId = "";
        let remainingPaymentUrl = "";

        if (usePaypal) {
            // ── PayPal path ──────────────────────────────────────────────
            const paypalUsername = process.env.PAYPAL_ME_USERNAME;
            paymentUrl = `https://paypal.me/${paypalUsername}/${chargeAmount}EUR`;
            paypalPaymentUrl = paymentUrl;
        } else {
            // ── Stripe path ──────────────────────────────────────────────
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
            paymentUrl = session.url;

            if (isShortNotice) {
                remainingStripeSessionId = session.id;
                remainingPaymentUrl = session.url;
            } else {
                stripeSessionId = session.id;
                stripePaymentUrl = session.url;
            }
        }

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
            stripeSessionId,
            stripePaymentUrl,
            paypalPaymentUrl,
            preferredPaymentMethod: paymentMethod,
            locale: request.locale || "en",
        };

        // For short-notice Stripe, store session in remaining fields
        if (isShortNotice && !usePaypal) {
            confirmedData.remainingStripeSessionId = remainingStripeSessionId;
            confirmedData.remainingPaymentUrl = remainingPaymentUrl;
            confirmedData.remainingPaymentStatus = "pending";
        }

        const confirmed = await ReservationConfirmed.create(confirmedData);

        // 6. Remove the original request
        await ReservationRequest.findByIdAndDelete(req.params.id);

        // 7. Send appropriate email
        let emailSent = false;

        try {
            let emailData;

            if (usePaypal) {
                // PayPal emails
                if (isShortNotice) {
                    emailData = buildPaypalFullPaymentEmail({
                        guestName: request.guestName,
                        checkInDate: checkInStr,
                        checkOutDate: checkOutStr,
                        nights: request.nights,
                        totalPrice: request.totalPrice,
                        paymentUrl,
                        locale: request.locale || "en",
                    });
                    console.log(`📧 PayPal full payment email sent to ${request.guestEmail} (short-notice)`);
                } else {
                    const remainingBalance = request.totalPrice - depositAmount;
                    emailData = buildPaypalConfirmationEmail({
                        guestName: request.guestName,
                        checkInDate: checkInStr,
                        checkOutDate: checkOutStr,
                        nights: request.nights,
                        totalPrice: request.totalPrice,
                        depositAmount,
                        remainingBalance,
                        paymentUrl,
                        locale: request.locale || "en",
                    });
                    console.log(`📧 PayPal deposit email sent to ${request.guestEmail}`);
                }
            } else {
                // Stripe emails
                if (isShortNotice) {
                    emailData = buildFullPaymentEmail({
                        guestName: request.guestName,
                        checkInDate: checkInStr,
                        checkOutDate: checkOutStr,
                        nights: request.nights,
                        totalPrice: request.totalPrice,
                        paymentUrl,
                        locale: request.locale || "en",
                    });
                    console.log(`📧 Full payment email sent to ${request.guestEmail} (short-notice)`);
                } else {
                    const remainingBalance = request.totalPrice - depositAmount;
                    emailData = buildConfirmationEmail({
                        guestName: request.guestName,
                        checkInDate: checkInStr,
                        checkOutDate: checkOutStr,
                        nights: request.nights,
                        totalPrice: request.totalPrice,
                        depositAmount,
                        remainingBalance,
                        paymentUrl,
                        locale: request.locale || "en",
                    });
                    console.log(`📧 Deposit payment email sent to ${request.guestEmail}`);
                }
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
        }

        res.status(201).json({
            message: emailSent
                ? "Reservation confirmed — payment link generated & email sent"
                : "Reservation confirmed — payment link generated (email failed)",
            confirmed,
            paymentUrl,
            emailSent,
            isShortNotice,
            paymentMethod,
        });
    } catch (error) {
        console.error("Confirm error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
