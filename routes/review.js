const express = require("express");
const router = express.Router({ mergeParams: true });
const { wrapAsync } = require("../utils/wrapasync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// Import Review Controller
const reviewController = require("../controllers/reviews.js");

// Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;