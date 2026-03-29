const mongoose = require("mongoose");

const reservationConfirmedSchema = new mongoose.Schema(
    {
        guestName: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, "Guest name must be at least 2 characters"],
            validate: {
                validator: function (v) {
                    return /^[\p{L}\s'\-\.]+$/u.test(v) && !/\d/.test(v);
                },
                message: "Guest name may only contain letters, spaces, hyphens, and apostrophes",
            },
        },
        guestEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        guestPhone: {
            type: String,
            trim: true,
            default: "",
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        nights: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        depositAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        comment: {
            type: String,
            trim: true,
            default: "",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        stripeSessionId: {
            type: String,
            default: "",
        },
        stripePaymentUrl: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["active", "cancelled", "completed"],
            default: "active",
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        cancellationReason: {
            type: String,
            trim: true,
            default: "",
        },
        checkedIn: {
            type: Boolean,
            default: false,
        },
        checkedInAt: {
            type: Date,
            default: null,
        },
        checkInStatus: {
            type: String,
            enum: ["pending", "sent", "completed"],
            default: "pending",
        },
        checkInToken: {
            type: String,
            default: "",
        },
        remainingPaymentStatus: {
            type: String,
            enum: ["not_requested", "pending", "paid", "failed"],
            default: "not_requested",
        },
        remainingStripeSessionId: {
            type: String,
            default: "",
        },
        remainingPaymentUrl: {
            type: String,
            default: "",
        },
        accessInfoSent: {
            type: Boolean,
            default: false,
        },
        locale: {
            type: String,
            enum: ["en", "es", "cs"],
            default: "en",
        },
        preferredPaymentMethod: {
            type: String,
            enum: ["stripe", "paypal"],
            default: "stripe",
        },
        paypalPaymentUrl: {
            type: String,
            default: "",
        },
        remainingPaypalPaymentUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        collection: "ReservationConfirmed",
        toJSON: {
            transform(doc, ret) {
                if (ret.checkIn) ret.checkIn = ret.checkIn.toISOString().split("T")[0];
                if (ret.checkOut) ret.checkOut = ret.checkOut.toISOString().split("T")[0];
                return ret;
            },
        },
    }
);

module.exports = mongoose.model("ReservationConfirmed", reservationConfirmedSchema);
