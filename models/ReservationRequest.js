const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        guestName: {
            type: String,
            required: [true, "Guest name is required"],
            trim: true,
        },
        guestEmail: {
            type: String,
            required: [true, "Guest email is required"],
            trim: true,
            lowercase: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Please provide a valid email address",
            ],
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
            min: [0, "Total price must be a positive number"],
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
