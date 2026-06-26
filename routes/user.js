const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../utils/wrapasync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// Import User Controller
const userController = require("../controllers/users.js");

// 1. Signup Flow: "/signup"
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// 2. Login Flow: "/login"
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// 3. Logout Route (Kept separate because it has a unique path)
router.get("/logout", userController.logout);

module.exports = router;