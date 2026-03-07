const express = require("express");
const router = express.Router();
const ReservationRequest = require("../models/ReservationRequest");
const ReservationConfirmed = require("../models/ReservationConfirmed");
const { requireAdmin } = require("../config/authMiddleware");

/**
 * GET /api/admin/stats
 * Returns aggregated dashboard statistics (auth-protected).
 */
router.get("/stats", requireAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            pendingRequests,
            confirmedTotal,
            paymentPending,
            paymentPaid,
            paymentFailed,
            upcomingCheckIns,
        ] = await Promise.all([
            ReservationRequest.countDocuments(),
            ReservationConfirmed.countDocuments(),
            ReservationConfirmed.countDocuments({ paymentStatus: "pending" }),
            ReservationConfirmed.countDocuments({ paymentStatus: "paid" }),
            ReservationConfirmed.countDocuments({ paymentStatus: "failed" }),
            ReservationConfirmed.countDocuments({ checkIn: { $gte: today } }),
        ]);

        res.json({
            pendingRequests,
            confirmedTotal,
            paymentPending,
            paymentPaid,
            paymentFailed,
            upcomingCheckIns,
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
