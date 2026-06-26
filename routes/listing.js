const express = require("express");
const router = express.Router();
const { wrapAsync, ExpressError } = require("../utils/wrapasync");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");


const listingController = require("../controllers/listing.js");

const { storage } = require("../cloudConfig.js");
const multer  = require('multer');
const upload = multer({ storage });


const checkCloudinaryConfigured = (req, res, next) => {
    const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_KEY || process.env.CLOUD_API_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET || process.env.CLOUD_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
        req.flash('error', 'Image upload is not configured on the server. Please set Cloudinary credentials in .env.');
        return res.redirect('/listings/new');
    }
    next();
};


const validateListing = (req, res, next) => {
    if (!req.body.listing) {
        req.body.listing = {};
        for (let key of Object.keys(req.body)) {
            const match = key.match(/^listing\[(.+)\]$/);
            if (match) {
                req.body.listing[match[1]] = req.body[key];
            }
        }
    }

    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single("image"), 
        validateListing, 
        wrapAsync(listingController.createListing)
    );


router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single("image"), // Injects Multer parsing sequence before controller execution
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;