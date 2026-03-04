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
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// ── Custom validation: checkOut must be after checkIn ──────────────────
reservationSchema.pre("validate", function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    this.invalidate(
      "checkOut",
      "Check-out date must be after the check-in date"
    );
  }
  next();
});

module.exports = mongoose.model("Reservation", reservationSchema);
