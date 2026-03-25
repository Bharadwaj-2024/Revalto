const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/express_error.js");

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const normalizePhone = (phone) => {
    if (!phone || typeof phone !== "string") return "";
    return phone.trim().replace(/[\s-]+/g, "");
};

// Create a new booking/meeting request
module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        throw new ExpressError(404, "Property not found");
    }
    if (listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You cannot book a meeting for your own property");
        return res.redirect(`/listings/${id}`);
    }

    const { meetingDate, meetingTime, meetingType, message, phone } = req.body;
    const normalizedPhone = normalizePhone(phone || req.user.phone);

    if (!PHONE_REGEX.test(normalizedPhone)) {
        req.flash("error", "Please provide a valid mobile number (10-15 digits)");
        return res.redirect(`/listings/${id}`);
    }

    if (req.user.phone !== normalizedPhone) {
        await User.findByIdAndUpdate(req.user._id, { phone: normalizedPhone });
        req.user.phone = normalizedPhone;
    }

    const booking = new Booking({
        listing: listing._id,
        buyer: req.user._id,
        owner: listing.owner._id,
        meetingDate,
        meetingTime,
        meetingType,
        message,
        phone: normalizedPhone,
    });

    await booking.save();
    req.flash("success", "Meeting request sent to the property owner!");
    res.redirect(`/listings/${id}`);
};

// Show all bookings for the current user (as buyer or owner)
module.exports.myBookings = async (req, res) => {
    const buyerBookings = await Booking.find({ buyer: req.user._id })
        .populate("listing")
        .populate("owner")
        .sort({ createdAt: -1 });

    const ownerBookings = await Booking.find({ owner: req.user._id })
        .populate("listing")
        .populate("buyer")
        .sort({ createdAt: -1 });

    res.render("bookings/index.ejs", { buyerBookings, ownerBookings });
};

// Update booking status (owner confirms/cancels)
module.exports.updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ExpressError(404, "Booking not found");
    }

    // Only the owner can confirm/cancel
    if (!booking.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to update this booking");
        return res.redirect("/bookings");
    }

    booking.status = status;
    await booking.save();

    const statusMessages = {
        confirmed: "Meeting confirmed!",
        cancelled: "Meeting cancelled.",
        completed: "Meeting marked as completed.",
    };

    req.flash("success", statusMessages[status] || "Booking updated!");
    res.redirect("/bookings");
};

// Cancel booking (buyer cancels their own booking)
module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ExpressError(404, "Booking not found");
    }

    if (!booking.buyer.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking");
        return res.redirect("/bookings");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings");
};
