const mongoose = require("mongoose");

const reservationConfirmedSchema = new mongoose.Schema(
    {
        guestName: {
            type: String,
            required: true,
            trim: true,
        },
        guestEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "ReservationConfirmed",
    }
);

module.exports = mongoose.model("ReservationConfirmed", reservationConfirmedSchema);
