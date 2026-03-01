const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
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
    offerPrice: {
        type: Number,
        required: true,
        min: 0,
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
        enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
