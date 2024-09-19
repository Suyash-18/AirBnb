const Listing = require("../models/listing.js");

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
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.image = {url, filename};
    newListing.owner = req.user._id;
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
    res.render("./listings/edit.ejs", {listing});
};

module.exports.updateListings = async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Edited!!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListings = async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!!");
    res.redirect(`/listings`);
};