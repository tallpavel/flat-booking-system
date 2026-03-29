const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        guestName: {
            type: String,
            required: [true, "Guest name is required"],
            trim: true,
            minlength: [2, "Guest name must be at least 2 characters"],
            maxlength: [100, "Guest name must be at most 100 characters"],
            validate: {
                validator: function (v) {
                    // Allow Unicode letters, spaces, hyphens, apostrophes, dots
                    return /^[\p{L}\s'\-\.]+$/u.test(v) && !/\d/.test(v);
                },
                message: "Guest name may only contain letters, spaces, hyphens, and apostrophes",
            },
        },
        guestEmail: {
            type: String,
            required: [true, "Guest email is required"],
            trim: true,
            lowercase: true,
            maxlength: [254, "Email address is too long"],
            match: [
                /^\S+@\S+\.\S+$/,
                "Please provide a valid email address",
            ],
        },
        guestPhone: {
            type: String,
            required: [true, "Guest phone number is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    // Must look like a real phone number:
                    // optional leading +, then digits/spaces/hyphens/parens/dots
                    // minimum 6, maximum 20 characters total
                    return /^\+?[\d\s\-().]{6,20}$/.test(v);
                },
                message: "Please provide a valid phone number (digits, spaces, hyphens, optional leading +)",
            },
        },
        checkIn: {
            type: Date,
            required: [true, "Check-in date is required"],
        },
        checkOut: {
            type: Date,
            required: [true, "Check-out date is required"],
        },
        nights: {
            type: Number,
            required: [true, "Number of nights is required"],
            min: [3, "Minimum stay is 3 nights"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [1, "Total price must be a positive number"],
        },
        comment: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Comment must be at most 500 characters"],
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
    },
    {
        timestamps: true, // adds createdAt & updatedAt automatically
        collection: "ReservationRequest", // match existing Atlas collection name
        toJSON: {
            transform(doc, ret) {
                if (ret.checkIn) ret.checkIn = ret.checkIn.toISOString().split("T")[0];
                if (ret.checkOut) ret.checkOut = ret.checkOut.toISOString().split("T")[0];
                return ret;
            },
        },
    }
);

// ── Custom validation: checkOut must be after checkIn ──────────────────
reservationSchema.pre("validate", function () {
    if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
        this.invalidate(
            "checkOut",
            "Check-out date must be after the check-in date"
        );
    }
});

module.exports = mongoose.model("ReservationRequest", reservationSchema);
