const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const Purchase = require("../models/purchase.js");

// Geocode location using Nominatim (OpenStreetMap) - free, no API key needed
async function geocodeLocation(location, country) {
    try {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { "User-Agent": "Revalto/1.0" },
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                type: "Point",
                coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
            };
        }
    } catch (err) {
        console.log("Geocoding error:", err.message);
    }
    return { type: "Point", coordinates: [0, 0] };
}

module.exports.index = async (req, res) => {
    const { category } = req.query;
    const matchStage = {};
    if (category && category !== "all") {
        matchStage.category = category;
    }
    const allListings = await Listing.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                reviewCount: { $size: { $ifNull: ["$reviews", []] } },
            },
        },
        { $sort: { reviewCount: -1 } },
    ]);
    res.render("listings/index.ejs", { all_listing: allListings, activeCategory: category || "all" });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner")
        .populate("documents");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    // Check if the current user has existing bookings/offers for this listing
    let existingBooking = null;
    let existingOffer = null;
    if (req.user) {
        existingBooking = await Booking.findOne({
            listing: id,
            buyer: req.user._id,
            status: { $in: ["pending", "confirmed"] },
        });
        existingOffer = await Purchase.findOne({
            listing: id,
            buyer: req.user._id,
            status: { $in: ["pending", "accepted"] },
        });
    }

    res.render("listings/show.ejs", { listing, existingBooking, existingOffer });
};

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }
    newListing.owner = req.user._id;

    // Geocode the location
    newListing.geometry = await geocodeLocation(
        req.body.listing.location,
        req.body.listing.country
    );

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
        await listing.save();
    }

    // Re-geocode if location or country changed
    if (req.body.listing.location || req.body.listing.country) {
        const updatedListing = await Listing.findById(id);
        updatedListing.geometry = await geocodeLocation(
            updatedListing.location,
            updatedListing.country
        );
        await updatedListing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};

module.exports.about = (req, res) => {
    res.render("listings/about.ejs");
};