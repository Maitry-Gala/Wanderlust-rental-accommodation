const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MY_ACCESS_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const flash = require("connect-flash");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({path :"reviews"
    , populate :"author",
  }
).populate("owner");
  console.log("Owner:", listing.owner);

  if(!listing){
    req.flash("error","Listing you requested for does not exists!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res,next) => {
  try{
    if (!req.file) {
      req.flash("error", "Please upload a valid image file (max 1MB)");
      return res.redirect("/listings/new");
    }
    
  let response = await  geocodingClient
  .forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
  .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url,filename};

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success","New Listing Created!");
  return res.redirect("/listings");

  } catch (error) {
    console.log("Error creating listing:", error);
    req.flash("error", "Something went wrong while creating the listing");
    return res.redirect("/listings/new");
  }
}

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
    if(!listing){
    req.flash("error","Listing you requested for does not exists!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

  res.render("listings/edit.ejs", { listing,originalImageUrl });
}

module.exports.updateListing = async (req, res) => {

  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file!== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url,filename};
      await listing.save();
  }

  req.flash("success","Listing Updated");
  res.redirect(`/listings/${id}`);
}

module.exports.filter = async (req, res, next) => {
  let { id } = req.params;
  let formattedId = id.replace(/\s+/g, '-');
  
  let allListings = await Listing.find({ category: formattedId });
  if (allListings.length != 0) {
    res.locals.success = `Listings Filtered by ${id}!`;
    res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `There is no any Listing for ${id}!`);
    res.redirect("/listings");
  }
};

module.exports.searchListing = async (req, res) => {
  const { q } = req.query;

  try {
    // If no query is provided, redirect with error message
    if (!q || q.trim() === "") {
      req.flash("error", "Please enter a search term.");
      return res.redirect("/listings");
    }

    const listings = await Listing.find({
      country: { $regex: q, $options: "i" }
    });

    if (listings.length === 0) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    return res.render("listings/index", {
      allListings: listings,
      message: null
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send("An error occurred while searching listings.");
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted Successfully!");
  res.redirect("/listings");
}

