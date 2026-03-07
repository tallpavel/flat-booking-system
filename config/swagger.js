const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Flat Booking System API",
            version: "1.0.0",
            description:
                "REST API for managing flat reservation requests and confirmed bookings.",
            contact: {
                name: "API Support",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
        components: {
            schemas: {
                ReservationRequest: {
                    type: "object",
                    required: ["guestName", "guestEmail", "checkIn", "checkOut", "nights", "totalPrice"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Auto-generated MongoDB ID",
                            example: "69a87ac8dd9809ada5fdfbc3",
                        },
                        guestName: {
                            type: "string",
                            description: "Full name of the guest",
                            example: "Jane Doe",
                        },
                        guestEmail: {
                            type: "string",
                            format: "email",
                            description: "Email address of the guest",
                            example: "jane@example.com",
                        },
                        checkIn: {
                            type: "string",
                            format: "date",
                            description: "Check-in date (YYYY-MM-DD)",
                            example: "2026-04-01",
                        },
                        checkOut: {
                            type: "string",
                            format: "date",
                            description: "Check-out date (YYYY-MM-DD, must be after check-in)",
                            example: "2026-04-05",
                        },
                        nights: {
                            type: "number",
                            description: "Number of nights (minimum 3)",
                            minimum: 3,
                            example: 4,
                        },
                        totalPrice: {
                            type: "number",
                            description: "Total price for the stay",
                            minimum: 0,
                            example: 480,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp when the record was created",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp when the record was last updated",
                        },
                    },
                },
                ReservationConfirmed: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Auto-generated MongoDB ID",
                            example: "69a87d6e864e60923a47aeb2",
                        },
                        guestName: {
                            type: "string",
                            description: "Full name of the guest",
                            example: "María López",
                        },
                        guestEmail: {
                            type: "string",
                            format: "email",
                            description: "Email address of the guest",
                            example: "maria.lopez@email.com",
                        },
                        checkIn: {
                            type: "string",
                            format: "date",
                            description: "Check-in date (YYYY-MM-DD)",
                            example: "2026-07-01",
                        },
                        checkOut: {
                            type: "string",
                            format: "date",
                            description: "Check-out date (YYYY-MM-DD)",
                            example: "2026-07-07",
                        },
                        nights: {
                            type: "number",
                            description: "Number of nights",
                            example: 6,
                        },
                        totalPrice: {
                            type: "number",
                            description: "Total price for the stay",
                            example: 900,
                        },
                        depositAmount: {
                            type: "number",
                            description: "30% deposit amount to collect",
                            example: 270,
                        },
                        comment: {
                            type: "string",
                            description: "Optional guest comment",
                            example: "We arrive late, around 10pm",
                        },
                        paymentStatus: {
                            type: "string",
                            enum: ["pending", "paid", "failed"],
                            description: "Status of the Stripe deposit payment",
                            example: "pending",
                        },
                        stripeSessionId: {
                            type: "string",
                            description: "Stripe Checkout Session ID",
                        },
                        stripePaymentUrl: {
                            type: "string",
                            description: "URL to send to the guest for payment",
                            example: "https://checkout.stripe.com/c/pay/cs_test_...",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                ReservationInput: {
                    type: "object",
                    required: ["guestName", "guestEmail", "checkIn", "checkOut", "nights", "totalPrice"],
                    properties: {
                        guestName: {
                            type: "string",
                            example: "Jane Doe",
                        },
                        guestEmail: {
                            type: "string",
                            format: "email",
                            example: "jane@example.com",
                        },
                        checkIn: {
                            type: "string",
                            format: "date",
                            example: "2026-04-01",
                        },
                        checkOut: {
                            type: "string",
                            format: "date",
                            example: "2026-04-05",
                        },
                        nights: {
                            type: "number",
                            description: "Number of nights (minimum 3)",
                            minimum: 3,
                            example: 4,
                        },
                        totalPrice: {
                            type: "number",
                            description: "Total price for the stay",
                            minimum: 0,
                            example: 480,
                        },
                    },
                },
                ContactInput: {
                    type: "object",
                    required: ["name", "email", "subject", "message"],
                    properties: {
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        subject: {
                            type: "string",
                            example: "Booking inquiry",
                        },
                        message: {
                            type: "string",
                            example: "I would like to know about availability in July.",
                        },
                    },
                },
                DailyRate: {
                    type: "object",
                    required: ["date", "price"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Auto-generated MongoDB ID",
                        },
                        date: {
                            type: "string",
                            format: "date",
                            description: "The specific date for this rate (YYYY-MM-DD)",
                            example: "2026-07-04",
                        },
                        price: {
                            type: "number",
                            description: "Price per night for this date",
                            minimum: 0,
                            example: 150,
                        },
                        note: {
                            type: "string",
                            description: "Optional label (e.g. Holiday, Weekend, High season)",
                            example: "Independence Day",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                DailyRateInput: {
                    type: "object",
                    required: ["date", "price"],
                    properties: {
                        date: {
                            type: "string",
                            format: "date",
                            description: "The date to set the price for",
                            example: "2026-07-04",
                        },
                        price: {
                            type: "number",
                            description: "Price per night",
                            minimum: 0,
                            example: 150,
                        },
                        note: {
                            type: "string",
                            description: "Optional label for this date",
                            example: "Independence Day",
                        },
                    },
                },
                ValidationError: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Validation failed",
                        },
                        errors: {
                            type: "array",
                            items: { type: "string" },
                            example: ["Guest name is required", "Check-in date is required"],
                        },
                    },
                },
                ServerError: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Server error",
                        },
                        error: {
                            type: "string",
                        },
                    },
                },
            },
        },
    },
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
