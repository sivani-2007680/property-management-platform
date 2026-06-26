// middleware.js
const Listing = require("./models/listing"); // MUST BE IMPORTED AT THE TOP
const Review = require("./models/review");
const { reviewSchema } = require("./schema.js");

// 1. Authentication Middleware
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Save the path the user was trying to access before getting kicked to login
        req.session.redirectUrl = req.originalUrl; 
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        req.flash("error", errMsg);
        return res.redirect("back");
    }
    next();
};

// 2. Save Redirect URL Middleware
// Passport automatically clears out session data upon successful login.
// This function saves our custom path into res.locals so it survives the login process!
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// 3. Authorization Middleware (ADDED IN THIS VIDEO)
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    // Safety check: if listing doesn't exist at all, don't try to read .owner
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Check if the current logged-in user is NOT the owner of the listing
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    
    next(); // Pass control to the next route function if they are the owner
};
// Add this to your existing middleware.js file

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params; // Extracts both listing id and review id from parameters
    let review = await Review.findById(reviewId);
    
    // Check if current user matches the author of the review
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};