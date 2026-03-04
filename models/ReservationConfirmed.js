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
