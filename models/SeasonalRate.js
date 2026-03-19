const mongoose = require("mongoose");

const seasonalRateSchema = new mongoose.Schema(
    {
        rates: {
            type: [Number],
            required: true,
            validate: {
                validator: (v) => v.length === 12,
                message: "Rates must contain exactly 12 values (one per month)",
            },
        },
    },
    {
        timestamps: true,
        collection: "SeasonalRate",
    }
);

module.exports = mongoose.model("SeasonalRate", seasonalRateSchema);
