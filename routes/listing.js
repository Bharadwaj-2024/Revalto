const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/express_error.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middlewares.js");
const ListingController = require("../controllers/listing.js");
const { upload } = require("../utils/cloudinary.js");

// Parse bracket-notation keys from multer into nested objects
const parseBody = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        const result = {};
        for (const key of Object.keys(req.body)) {
            const keys = key.replace(/\]/g, "").split("[");
            let current = result;
            for (let i = 0; i < keys.length; i++) {
                const k = keys[i];
                if (i === keys.length - 1) {
                    current[k] = req.body[key];
                } else {
                    if (!current[k] || typeof current[k] !== "object") {
                        current[k] = {};
                    }
                    current = current[k];
                }
            }
        }
        req.body = result;
    }
    next();
};

// Validation middleware
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    next();
};

// Async error wrapper
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Index Route
router.get("/", wrapAsync(ListingController.index));

// New Form
router.get("/new", isLoggedIn, ListingController.renderNewForm);

// About
router.get("/about", ListingController.about);

// Show Route
router.get("/:id", wrapAsync(ListingController.showListing));

// Create Route
router.post("/", isLoggedIn, upload.single("image"), parseBody, validateListing, wrapAsync(ListingController.createListing));

// Edit Form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

// Update Route
router.put("/:id", isLoggedIn, isOwner, upload.single("image"), parseBody, validateListing, wrapAsync(ListingController.updateListing));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

module.exports = router;