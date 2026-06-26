
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const initData = require("./init/data");
const Listing = require("./models/listing");
const session = require("express-session");
const flash = require("connect-flash"); 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";


const MongoStore = require("connect-mongo");

const store =MongoStore.create({
    mongoUrl: dbUrl,
    
    touchAfter: 24 * 3600, 
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log("Database connection failed:", err);
    });

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Mongo Connected Successfully");
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
    store: store,
    secret: process.env.SECRET || "9f3c8b2a7d4e91c0a6b7f5d8e2c1a9d0f4e6b8c3d1a2f9e7b6c5d4a3b2c1d0f", 
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));
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

// Init route
app.get("/init", async (req, res) => {
    try {
        await Listing.deleteMany({});
        const sampleData = initData.data.map((obj) => ({
            ...obj,
            owner: "6a3b8fa428a857462abd083b" 
        }));
        await Listing.insertMany(sampleData);
        res.json({ success: true, message: "Database initialized" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Demo User Route
app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

// Root route
app.get("/", (req, res) => {
   res.redirect("/listings");
});

// 4. FIXED ORDER: Actual application routers now run safely down here
app.use("/", userRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

// Test route
app.get("/test", (req, res, next) => {
    try {
        abc = abc;
    } catch (err) {
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    console.error("❌ BACKEND ERROR:", err); 
    res.status(statusCode).send(`Backend Error: ${message}`);
});

app.listen(8080, () => {
    console.log("server is running on port 8080");
});