const mongoose = require("mongoose");

const dailyRateSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, "Date is required"],
            unique: true, // one price per date — prevents duplicates at DB level
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price must be a positive number"],
        },
        note: {
            type: String,
            trim: true,
            default: "", // optional label like "Holiday", "Weekend", "High season"
        },
    },
    {
        timestamps: true,
        collection: "DailyRate",
        toJSON: {
            transform(doc, ret) {
                if (ret.date) ret.date = ret.date.toISOString().split("T")[0];
                return ret;
            },
        },
    }
);

// Index on date for fast month-range queries
dailyRateSchema.index({ date: 1 });

module.exports = mongoose.model("DailyRate", dailyRateSchema);
