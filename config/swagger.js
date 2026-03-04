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
                    required: ["guestName", "guestEmail", "checkIn", "checkOut"],
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
                            format: "date-time",
                            description: "Check-in date",
                            example: "2026-04-01T00:00:00.000Z",
                        },
                        checkOut: {
                            type: "string",
                            format: "date-time",
                            description: "Check-out date (must be after check-in)",
                            example: "2026-04-05T00:00:00.000Z",
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
                            format: "date-time",
                            description: "Check-in date",
                            example: "2026-07-01T00:00:00.000Z",
                        },
                        checkOut: {
                            type: "string",
                            format: "date-time",
                            description: "Check-out date",
                            example: "2026-07-07T00:00:00.000Z",
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
                    required: ["guestName", "guestEmail", "checkIn", "checkOut"],
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
