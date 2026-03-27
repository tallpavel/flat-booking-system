/**
 * Server-side price calculator.
 *
 * Authoritatively computes totalPrice and nights from the database,
 * preventing clients from sending manipulated values.
 *
 * Logic mirrors the frontend's calculateStayPrice() but is canonical.
 */

const DailyRate = require("../models/DailyRate");
const SeasonalRate = require("../models/SeasonalRate");

// Fallback seasonal defaults (same as in seasonalRates.js route)
const DEFAULT_SEASONAL_RATES = [150, 175, 165, 155, 145, 155, 180, 190, 160, 150, 145, 180];

/**
 * Format a Date as "YYYY-MM-DD" in UTC.
 * @param {Date} d
 * @returns {string}
 */
function toDateKey(d) {
    return d.toISOString().split("T")[0];
}

/**
 * Calculate the authoritative total price and night count for a stay.
 *
 * @param {Date} checkIn  — check-in date (midnight UTC)
 * @param {Date} checkOut — check-out date (midnight UTC)
 * @returns {Promise<{ nights: number, totalPrice: number }>}
 */
async function calculatePrice(checkIn, checkOut) {
    // 1. Fetch seasonal default rates
    const seasonalDoc = await SeasonalRate.findOne().sort({ updatedAt: -1 });
    const seasonalRates = seasonalDoc ? seasonalDoc.rates : DEFAULT_SEASONAL_RATES;

    // 2. Fetch custom daily rates for the date range
    const dailyRates = await DailyRate.find({
        date: { $gte: checkIn, $lt: checkOut },
    });

    // Build a lookup map: "YYYY-MM-DD" → price
    const customRateMap = new Map();
    for (const dr of dailyRates) {
        customRateMap.set(toDateKey(dr.date), dr.price);
    }

    // 3. Walk each night and sum prices
    let totalPrice = 0;
    let nights = 0;
    const cursor = new Date(checkIn);

    while (cursor < checkOut) {
        const key = toDateKey(cursor);

        if (customRateMap.has(key)) {
            totalPrice += customRateMap.get(key);
        } else {
            // Fall back to seasonal rate for this month
            totalPrice += seasonalRates[cursor.getUTCMonth()];
        }

        nights++;
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return { nights, totalPrice };
}

module.exports = { calculatePrice };
