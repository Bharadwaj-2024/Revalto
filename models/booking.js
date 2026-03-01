const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    meetingDate: {
        type: Date,
        required: true,
    },
    meetingTime: {
        type: String,
        required: true,
    },
    meetingType: {
        type: String,
        enum: ["in-person", "video-call", "phone-call"],
        default: "in-person",
    },
    message: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Booking", bookingSchema);
