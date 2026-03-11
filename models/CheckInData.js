const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    nationality: { type: String, required: true, trim: true },
    documentType: { type: String, enum: ["passport", "id_card", "driving_license"], required: true },
    documentNumber: { type: String, required: true, trim: true },
}, { _id: true });

const checkInDataSchema = new mongoose.Schema(
    {
        reservationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReservationConfirmed",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        guestName: { type: String, required: true },
        guestEmail: { type: String, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        guests: [guestSchema],
        submittedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        collection: "CheckInData",
        toJSON: {
            transform(doc, ret) {
                if (ret.checkIn) ret.checkIn = ret.checkIn.toISOString().split("T")[0];
                if (ret.checkOut) ret.checkOut = ret.checkOut.toISOString().split("T")[0];
                return ret;
            },
        },
    }
);

module.exports = mongoose.model("CheckInData", checkInDataSchema);
