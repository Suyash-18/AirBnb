const express = require('express');
const app  = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

let port = 8080;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRETE,       
    },
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("Error in Mongo Session Store", err);
})

const sessionOption = {
    store,
    secret: process.env.SESSION_SECRETE,
    resave: false,
    saveUninitialized: true,
}

main().then(() => {
    console.log("Connected Successfully!!");
}).catch((err) => {
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}



// app.get("/", wrapAsync((req, res) => {
//     res.cookie("hi from name", "hello from value")
//     res.send("Heeyyyy!");
// }));


app.use(cookieParser());
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
// app.get("/demouser",async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);


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