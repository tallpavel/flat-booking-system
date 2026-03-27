const express = require("express");
const router = express.Router();
const DailyRate = require("../models/DailyRate");
const { requireAdmin } = require("../config/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Daily Rates
 *   description: Dynamic daily pricing for the flat
 */

/**
 * @swagger
 * /api/daily-rates:
 *   post:
 *     summary: Set or update the price for a specific date
 *     description: If a rate for the given date exists, it updates the price. Otherwise it creates a new entry.
 *     tags: [Daily Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DailyRateInput'
 *     responses:
 *       200:
 *         description: Rate set/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyRate'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", requireAdmin, async (req, res) => {
    try {
        const { date, price, note } = req.body;

        if (!date || price === undefined) {
            return res.status(400).json({
                message: "Both 'date' and 'price' are required",
            });
        }

        // Normalise to midnight UTC to avoid timezone duplicates
        const normalizedDate = new Date(date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        // Upsert: update if exists, create if not
        const dailyRate = await DailyRate.findOneAndUpdate(
            { date: normalizedDate },
            { price, note: note || "" },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(dailyRate);
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: "Validation failed", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/daily-rates:
 *   get:
 *     summary: Get all custom prices for a given month
 *     description: Returns daily rates for the specified year and month. Defaults to the current month if not provided.
 *     tags: [Daily Rates]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (e.g. 2026). Defaults to current year.
 *         example: 2026
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month (1–12). Defaults to current month.
 *         example: 7
 *     responses:
 *       200:
 *         description: Array of daily rates for the month
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DailyRate'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        const now = new Date();
        const year = parseInt(req.query.year) || now.getUTCFullYear();
        const month = parseInt(req.query.month) || now.getUTCMonth() + 1; // 1-indexed

        // Build date range: first day of month → first day of next month
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1));

        const rates = await DailyRate.find({
            date: { $gte: startDate, $lt: endDate },
        }).sort({ date: 1 });

        res.set('Cache-Control', 'no-store');
        res.json(rates);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @swagger
 * /api/daily-rates/{id}:
 *   delete:
 *     summary: Delete a daily rate
 *     tags: [Daily Rates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: DailyRate MongoDB ID
 *     responses:
 *       200:
 *         description: Rate deleted successfully
 *       404:
 *         description: Rate not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const rate = await DailyRate.findByIdAndDelete(req.params.id);

        if (!rate) {
            return res.status(404).json({ message: "Daily rate not found" });
        }

        res.json({ message: "Daily rate deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
