const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middlewares.js");
const DocumentController = require("../controllers/document.js");
const { docUpload } = require("../utils/cloudinary.js");

// Async error wrapper
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Upload document for a listing
router.post("/", isLoggedIn, docUpload.single("document"), wrapAsync(DocumentController.uploadDocument));

// Delete a document
router.delete("/:docId", isLoggedIn, wrapAsync(DocumentController.deleteDocument));

module.exports = router;
