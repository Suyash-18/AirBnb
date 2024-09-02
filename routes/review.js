const express = require('express');
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const {validatReview, isLoggedin, isReviewAuthor} = require('../middleware.js');

// Review Create Route
router.post("/", isLoggedin,validatReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log(newReview);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    console.log(listing);
    req.flash("success", "New review Created!!");
    res.redirect(`/listings/${listing.id}`);
}));

//Delete Review
router.delete("/:reviewId", isLoggedin, isReviewAuthor,wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!!");

    res.redirect(`/listings/${id}`);
}));

module.exports = router;