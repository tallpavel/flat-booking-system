const mongoose = require("mongoose");

const blockedDateSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, "Date is required"],
            unique: true, // one entry per date — prevents duplicates at DB level
        },
        reason: {
            type: String,
            trim: true,
            default: "", // optional label like "Maintenance", "Personal use"
        },
    },
    {
        timestamps: true,
        collection: "BlockedDate",
        toJSON: {
            transform(doc, ret) {
                if (ret.date) ret.date = ret.date.toISOString().split("T")[0];
                return ret;
            },
        },
    }
);

// Index on date for fast queries
blockedDateSchema.index({ date: 1 });

module.exports = mongoose.model("BlockedDate", blockedDateSchema);
