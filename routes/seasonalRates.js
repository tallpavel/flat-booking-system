const express = require("express");
const router = express.Router();
const SeasonalRate = require("../models/SeasonalRate");
const { requireAdmin } = require("../config/authMiddleware");

// Fallback defaults (same as the original hardcoded values)
const DEFAULT_RATES = [150, 175, 165, 155, 145, 155, 180, 190, 160, 150, 145, 180];

/**
 * @swagger
 * tags:
 *   name: Seasonal Rates
 *   description: Monthly default nightly pricing
 */

/**
 * @swagger
 * /api/seasonal-rates:
 *   get:
 *     summary: Get the current seasonal default rates
 *     description: >
 *       Public endpoint — returns an array of 12 monthly default nightly rates.
 *       Falls back to hardcoded defaults if none have been set.
 *     tags: [Seasonal Rates]
 *     responses:
 *       200:
 *         description: Array of 12 monthly rates
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        const doc = await SeasonalRate.findOne().sort({ updatedAt: -1 });

        res.set("Cache-Control", "no-store");
        res.json({
            rates: doc ? doc.rates : DEFAULT_RATES,
            updatedAt: doc ? doc.updatedAt : null,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/seasonal-rates:
 *   put:
 *     summary: Update seasonal default rates
 *     description: >
 *       Admin-only. Replaces all 12 monthly default rates.
 *       Expects { rates: [jan, feb, mar, ...dec] }.
 *     tags: [Seasonal Rates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rates]
 *             properties:
 *               rates:
 *                 type: array
 *                 items:
 *                   type: number
 *                 minItems: 12
 *                 maxItems: 12
 *                 example: [150, 175, 165, 155, 145, 155, 180, 190, 160, 150, 145, 180]
 *     responses:
 *       200:
 *         description: Rates updated successfully
 *       400:
 *         description: Invalid rates
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.put("/", requireAdmin, async (req, res) => {
    try {
        const { rates } = req.body;

        if (!Array.isArray(rates) || rates.length !== 12) {
            return res.status(400).json({
                message: "Rates must be an array of exactly 12 numbers (one per month)",
            });
        }

        // Validate all values are positive numbers
        for (let i = 0; i < 12; i++) {
            if (typeof rates[i] !== "number" || rates[i] < 0) {
                return res.status(400).json({
                    message: `Invalid rate for month ${i + 1}: must be a non-negative number`,
                });
            }
        }

        // Upsert: find existing or create new
        const doc = await SeasonalRate.findOneAndUpdate(
            {},
            { rates },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({
            rates: doc.rates,
            updatedAt: doc.updatedAt,
            message: "Seasonal rates updated successfully",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
