const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const BookingController = require("../controllers/booking.js");

// Async error wrapper
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// View all my bookings
router.get("/", isLoggedIn, wrapAsync(BookingController.myBookings));

// Create a booking for a listing
router.post("/listing/:id", isLoggedIn, wrapAsync(BookingController.createBooking));

// Update booking status (owner)
router.post("/:bookingId/status", isLoggedIn, wrapAsync(BookingController.updateBookingStatus));

// Cancel booking (buyer)
router.post("/:bookingId/cancel", isLoggedIn, wrapAsync(BookingController.cancelBooking));

module.exports = router;
