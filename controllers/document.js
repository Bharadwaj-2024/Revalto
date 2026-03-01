const Document = require("../models/document.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/express_error.js");

// Upload a document for a listing (owner only)
module.exports.uploadDocument = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Property not found");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "Only the property owner can upload documents");
        return res.redirect(`/listings/${id}`);
    }

    if (!req.file) {
        req.flash("error", "Please select a file to upload");
        return res.redirect(`/listings/${id}`);
    }

    const { name, docType } = req.body;

    const doc = new Document({
        listing: listing._id,
        uploadedBy: req.user._id,
        name: name || req.file.originalname,
        docType: docType || "other",
        file: {
            url: req.file.path,
            filename: req.file.filename,
        },
    });

    await doc.save();
    listing.documents.push(doc._id);
    await listing.save();

    req.flash("success", "Document uploaded successfully!");
    res.redirect(`/listings/${id}`);
};

// Delete a document (owner only)
module.exports.deleteDocument = async (req, res) => {
    const { id, docId } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Property not found");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "Only the property owner can delete documents");
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, { $pull: { documents: docId } });
    await Document.findByIdAndDelete(docId);

    req.flash("success", "Document deleted successfully!");
    res.redirect(`/listings/${id}`);
};
