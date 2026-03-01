const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares.js");
const PurchaseController = require("../controllers/purchase.js");

// Async error wrapper
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// View all my offers
router.get("/", isLoggedIn, wrapAsync(PurchaseController.myOffers));

// Create a purchase offer for a listing
router.post("/listing/:id", isLoggedIn, wrapAsync(PurchaseController.createOffer));

// Update offer status (owner)
router.post("/:purchaseId/status", isLoggedIn, wrapAsync(PurchaseController.updateOfferStatus));

// Cancel offer (buyer)
router.post("/:purchaseId/cancel", isLoggedIn, wrapAsync(PurchaseController.cancelOffer));

module.exports = router;
