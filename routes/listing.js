const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");

let validatListing = (req, res, next)=> {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , errmsg);
    }else{
        next();
    }
}

// Index Route
router.get("/", wrapAsync( async (req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));
// New Route
router.get("/new" ,wrapAsync( (req,res) => {
    res.render("./listings/new.ejs");
}));
// Show Rout
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));
// Create Route
router.post("/", validatListing ,wrapAsync( async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid data Listings!!");
    // }
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("./listings");
}));
//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));
// Update Route
router.put("/:id", validatListing , wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
// Delete Route
router.delete("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
}));

module.exports = router;