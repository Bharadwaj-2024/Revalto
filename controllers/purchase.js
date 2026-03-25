const Purchase = require("../models/purchase.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/express_error.js");

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const normalizePhone = (phone) => {
    if (!phone || typeof phone !== "string") return "";
    return phone.trim().replace(/[\s-]+/g, "");
};

// Create a purchase offer
module.exports.createOffer = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        throw new ExpressError(404, "Property not found");
    }

    if (listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You cannot make an offer on your own property");
        return res.redirect(`/listings/${id}`);
    }

    if (listing.status === "sold") {
        req.flash("error", "This property has already been sold");
        return res.redirect(`/listings/${id}`);
    }

    // Check if buyer already has a pending offer
    const existingOffer = await Purchase.findOne({
        listing: id,
        buyer: req.user._id,
        status: { $in: ["pending", "accepted"] },
    });

    if (existingOffer) {
        req.flash("error", "You already have an active offer on this property");
        return res.redirect(`/listings/${id}`);
    }

    const { offerPrice, message, phone } = req.body;
    const normalizedPhone = normalizePhone(phone || req.user.phone);

    if (!PHONE_REGEX.test(normalizedPhone)) {
        req.flash("error", "Please provide a valid mobile number (10-15 digits)");
        return res.redirect(`/listings/${id}`);
    }

    if (req.user.phone !== normalizedPhone) {
        await User.findByIdAndUpdate(req.user._id, { phone: normalizedPhone });
        req.user.phone = normalizedPhone;
    }

    const purchase = new Purchase({
        listing: listing._id,
        buyer: req.user._id,
        owner: listing.owner._id,
        offerPrice,
        message,
        phone: normalizedPhone,
    });

    await purchase.save();

    // Update listing status to under-offer
    listing.status = "under-offer";
    await listing.save();

    req.flash("success", "Purchase offer sent to the property owner!");
    res.redirect(`/listings/${id}`);
};

// View all purchase offers (buyer and owner)
module.exports.myOffers = async (req, res) => {
    const buyerOffers = await Purchase.find({ buyer: req.user._id })
        .populate("listing")
        .populate("owner")
        .sort({ createdAt: -1 });

    const ownerOffers = await Purchase.find({ owner: req.user._id })
        .populate("listing")
        .populate("buyer")
        .sort({ createdAt: -1 });

    res.render("purchases/index.ejs", { buyerOffers, ownerOffers });
};

// Update offer status (owner accepts/rejects)
module.exports.updateOfferStatus = async (req, res) => {
    const { purchaseId } = req.params;
    const { status } = req.body;

    const purchase = await Purchase.findById(purchaseId).populate("listing");
    if (!purchase) {
        throw new ExpressError(404, "Offer not found");
    }

    if (!purchase.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to update this offer");
        return res.redirect("/purchases");
    }

    purchase.status = status;
    purchase.updatedAt = Date.now();
    await purchase.save();

    // If accepted, mark listing as sold and reject other pending offers
    if (status === "accepted") {
        await Listing.findByIdAndUpdate(purchase.listing._id, { status: "under-offer" });
    } else if (status === "completed") {
        await Listing.findByIdAndUpdate(purchase.listing._id, { status: "sold" });
        // Reject all other pending offers for this listing
        await Purchase.updateMany(
            {
                listing: purchase.listing._id,
                _id: { $ne: purchaseId },
                status: "pending",
            },
            { status: "rejected", updatedAt: Date.now() }
        );
    } else if (status === "rejected") {
        // If no other pending offers, set listing back to available
        const otherPending = await Purchase.countDocuments({
            listing: purchase.listing._id,
            _id: { $ne: purchaseId },
            status: { $in: ["pending", "accepted"] },
        });
        if (otherPending === 0) {
            await Listing.findByIdAndUpdate(purchase.listing._id, { status: "available" });
        }
    }

    const statusMessages = {
        accepted: "Offer accepted!",
        rejected: "Offer rejected.",
        completed: "Deal completed! Property marked as sold.",
        cancelled: "Offer cancelled.",
    };

    req.flash("success", statusMessages[status] || "Offer updated!");
    res.redirect("/purchases");
};

// Cancel offer (buyer cancels their own offer)
module.exports.cancelOffer = async (req, res) => {
    const { purchaseId } = req.params;
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new ExpressError(404, "Offer not found");
    }

    if (!purchase.buyer.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this offer");
        return res.redirect("/purchases");
    }

    purchase.status = "cancelled";
    purchase.updatedAt = Date.now();
    await purchase.save();

    // Check if listing should go back to available
    const otherActive = await Purchase.countDocuments({
        listing: purchase.listing,
        _id: { $ne: purchaseId },
        status: { $in: ["pending", "accepted"] },
    });
    if (otherActive === 0) {
        await Listing.findByIdAndUpdate(purchase.listing, { status: "available" });
    }

    req.flash("success", "Offer cancelled successfully");
    res.redirect("/purchases");
};
