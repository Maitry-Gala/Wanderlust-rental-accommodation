const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");;
const Listing = require("../models/listing.js");
const passport = require("passport");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const {upload,handleMulterError} = require("../cloudConfig.js");

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"),handleMulterError,validateListing,wrapAsync( listingController.createListing)
);

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

// Search Route
router.get("/filter/:id", wrapAsync(listingController.filter));
router.get("/search", wrapAsync(listingController.searchListing));

router.route("/:id")
//Show Route
.get( wrapAsync(listingController.showListing))
//Update Route
.put(isLoggedIn, isOwner, upload.single("listing[image]"),handleMulterError,validateListing,wrapAsync(listingController.updateListing))
//Delete Route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;