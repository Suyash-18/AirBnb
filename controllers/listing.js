const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
let mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: { path:"author" }}).populate("owner");
    // res.cookie(listing.title, listing._id);
    if(!listing){
        req.flash("error", "Listing you requested for dose not exist!!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
};

module.exports.createListings = async (req, res) => {   
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url, "..", filename);
        const newListing = new Listing(req.body.listing);
        newListing.image = {url, filename};
        newListing.owner = req.user._id;
        newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New listing Created!!");
    res.redirect("./listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for dose not exist!!");
        res.redirect("/listings");
    }
    let ogurl = listing.image.url;
    ogurl = ogurl.replace("/upload","/upload/w_300")
    res.render("./listings/edit.ejs", {listing, ogurl});
};

module.exports.updateListings = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Edited!!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListings = async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!!");
    res.redirect(`/listings`);
};