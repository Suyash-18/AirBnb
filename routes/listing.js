const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const { isLoggedin } = require('../middleware.js');

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
    // console.dir(req.cookies);
    res.render("./listings/index.ejs", {allListings});
}));
// New Route
router.get("/new" ,isLoggedin,wrapAsync( (req,res) => {
   
    res.render("./listings/new.ejs");
}));
// Show Rout
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    // res.cookie(listing.title, listing._id);
    if(!listing){
        req.flash("error", "Listing you requested for dose not exist!!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
}));
// Create Route
router.post("/", isLoggedin,validatListing ,wrapAsync( async (req, res) => {
    // if(!req.body.listing){
        //     throw new ExpressError(400,"Send Valid data Listings!!");
        // }
        
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New listing Created!!");
        res.redirect("./listings");
    }));
    //Edit Route
router.get("/:id/edit", isLoggedin,wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for dose not exist!!");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", {listing});
}));
// Update Route
router.put("/:id", isLoggedin,validatListing , wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Edited!!");
    res.redirect(`/listings/${id}`);
}));
// Delete Route
router.delete("/:id", isLoggedin,wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!!");
    res.redirect(`/listings`);
}));

module.exports = router;