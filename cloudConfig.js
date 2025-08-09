const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
 
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats: ["png","jpg","jpeg"],
      // Smart compression to save space and bandwidth
      transformation: [
        { quality: "auto:good", fetch_format: "auto" }, // Optimizes quality & format
        { width: 1200, height: 1200, crop: "limit" }    // Limits max dimensions
      ],
    },
});

// Create upload middleware with file size restriction
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // 1MB limit (reasonable for most photos)
        files: 1, // Only 1 file per upload
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Error handling middleware for upload errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash("error", "Image too large! Please upload an image smaller than 1MB");
            // Redirect based on whether it's create or edit
            if (req.params.id) {
                return res.redirect(`/listings/${req.params.id}/edit`);
            }
            return res.redirect("/listings/new");
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            req.flash("error", "Please upload only one image");
            return res.redirect("/listings/new");
        }
    }
    
    if (err && err.message === 'Only image files are allowed!') {
        req.flash("error", "Invalid file type! Please upload only PNG, JPG, or JPEG images");
        if (req.params.id) {
            return res.redirect(`/listings/${req.params.id}/edit`);
        }
        return res.redirect("/listings/new");
    }
    
    next(err);
};

module.exports = {
    cloudinary,
    storage,
    upload,
    handleMulterError,
};