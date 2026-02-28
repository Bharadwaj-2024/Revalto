const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.aggregate([
        {
            $addFields: {
                reviewCount: { $size: { $ifNull: ["$reviews", []] } },
            },
        },
        { $sort: { reviewCount: -1 } },
    ]);
    res.render("listings/index.ejs", { all_listing: allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
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