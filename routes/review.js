const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/express_error.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middlewares.js");
const ReviewController = require("../controllers/review.js");

// Validation middleware
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
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

// Create Review
router.post("/", isLoggedIn, validateReview, wrapAsync(ReviewController.createReview));

// Delete Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(ReviewController.destroyReview));

module.exports = router;
