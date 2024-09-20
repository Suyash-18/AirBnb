if (process.env.NODE_ENV!= "production") {
    require('dotenv').config()
}


const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const { isLoggedin,isOwner, validatListing } = require('../middleware.js');
const listingController = require("../controllers/listing.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

router.route("/")
.get(wrapAsync( listingController.index ))
.post(isLoggedin, upload.single('listing[image]'), validatListing  ,wrapAsync( listingController.createListings ));
// New Route
router.get("/new" ,isLoggedin,wrapAsync( listingController.renderNewForm ));

router.route("/:id")
.get(wrapAsync( listingController.showListings ))
.put(isLoggedin, isOwner, upload.single('listing[image]'),validatListing , wrapAsync( listingController.updateListings ))
.delete(isLoggedin, isOwner,wrapAsync( listingController.destroyListings ));
//Edit Route
router.get("/:id/edit", isLoggedin, isOwner,wrapAsync( listingController.renderEditForm ));

module.exports = router;