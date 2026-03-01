const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Storage for images (listings)
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "revalto",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
    },
});

// Storage for documents (PDFs, images)
const docStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "revalto_docs",
        resource_type: "auto",
    },
});

const upload = multer({ storage: imageStorage });
const docUpload = multer({ storage: docStorage });

module.exports = { cloudinary, upload, docUpload };
