const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    docType: {
        type: String,
        enum: [
            "title-deed",
            "sale-agreement",
            "encumbrance-certificate",
            "property-tax-receipt",
            "building-approval",
            "occupancy-certificate",
            "noc",
            "other",
        ],
        default: "other",
    },
    file: {
        url: String,
        filename: String,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Document", documentSchema);
