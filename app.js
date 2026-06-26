// 1. Load environment variables FIRST
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

// Import Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 2. Database URL Setup
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// 3. Connect-Mongo Setup (Ensure package is imported properly)
const MongoStore = require("connect-mongo");

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET || "mysupersecretcode", 
    },
    touchAfter: 24 * 3600, 
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// 4. Connect to Mongoose DB
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

// Session configuration options
const sessionOptions = {
    store: store,
    secret: process.env.SECRET || "mysupersecretcode", 
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// 3. FIXED ORDER: Sessions and Flash MUST run before routes!
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variables middleware
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
    res.send("HI, I am root");
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