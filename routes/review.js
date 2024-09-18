const express = require('express');
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const {validatReview, isLoggedin, isReviewAuthor} = require('../middleware.js');
const reviewController = require("../controllers/review.js")

// Review Create Route
router.post("/", isLoggedin,validatReview, wrapAsync( reviewController.createReview ));

//Delete Review
router.delete("/:reviewId", isLoggedin, isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;