const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    documents: [
        {
            type: Schema.Types.ObjectId,
            ref: "Document",
        },
    ],
    status: {
        type: String,
        enum: ["available", "under-offer", "sold"],
        default: "available",
    },
});

const Document = require('./document.js');
const Booking = require('./booking.js');
const Purchase = require('./purchase.js');

// Middleware: when a listing is deleted, delete all related data
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
        await Document.deleteMany({ _id: { $in: listing.documents } });
        await Booking.deleteMany({ listing: listing._id });
        await Purchase.deleteMany({ listing: listing._id });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;