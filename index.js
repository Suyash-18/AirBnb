const express = require('express');
const app  = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

let port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")))

const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected Successfully!!");
}).catch((err) => {
    console.log(err);
})

async function main(){
    await mongoose.connect(mongoUrl);
}

let validatListing = (req, res, next)=> {
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400 , error);
    }else{
        next();
    }
}

app.get("/", wrapAsync((req, res) => {
    res.send("Heeyyyy!");
}));
// Index Route
app.get("/listings", wrapAsync( async (req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));
// New Route
app.get("/listings/new" ,wrapAsync( (req,res) => {
    res.render("./listings/new.ejs");
}));
// Show Rout
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
}));
// Create Route
app.post("/listings", validatListing ,wrapAsync( async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid data Listings!!");
    // }
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("./listings");
}));
//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));
// Update Route
app.put("/listings/:id", validatListing , wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
// Delete Route
app.delete("/listings/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
}));

// app.get("/testlist",async (req, res) => {
//     let sample = new Listing({
//         title : "Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sample.save();
//     console.log("Sample saved");
//     res.send("Successful testing!!");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404,"Page Not Found."))
})
app.use((err, req, res, next) => {
    let {status = 500, message = "Something is Fucked Up!!!"} = err;
    res.render("errors.ejs" ,{err})
})

app.listen(port, () => {
    console.log(`server is on ${port}.`);
})