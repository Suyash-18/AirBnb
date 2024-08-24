const express = require('express');
const app  = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const review = require("./routes/review.js");

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



app.get("/", wrapAsync((req, res) => {
    res.send("Heeyyyy!");
}));

app.use("/listings", listings);
app.use("/listings/:id/review", review);


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