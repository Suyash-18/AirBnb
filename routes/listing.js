const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const { isLoggedin,isOwner, validatListing } = require('../middleware.js');
const listingController = require("../controllers/listing.js")


// Index Route
router.get("/", wrapAsync( listingController.index ));
// New Route
router.get("/new" ,isLoggedin,wrapAsync( (req,res) => {
   
    res.render("./listings/new.ejs");
}));
// Show Rout
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: { path:"author" }}).populate("owner");
    // res.cookie(listing.title, listing._id);
    if(!listing){
        req.flash("error", "Listing you requested for dose not exist!!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
}));
// Create Route
router.post("/",
    isLoggedin,
    validatListing ,
    wrapAsync( async (req, res) => {     
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New listing Created!!");
        res.redirect("./listings");
    }));
//Edit Route
router.get("/:id/edit", isLoggedin, isOwner,wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for dose not exist!!");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", {listing});
}));
// Update Route
router.put("/:id", isLoggedin, isOwner,validatListing , wrapAsync(async (req,res) => {
    
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Edited!!");
    res.redirect(`/listings/${id}`);
}));
// Delete Route
router.delete("/:id", isLoggedin, isOwner,wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!!");
    res.redirect(`/listings`);
}));

module.exports = router;