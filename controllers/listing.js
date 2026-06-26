// controllers/listing.js

const Listing = require("../models/listing");

// --- 1. CONFIGURATION: IMPORT AND INITIALIZE MAPBOX GEOCODING SDK ---
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const DEFAULT_GEOMETRY = { type: "Point", coordinates: [78.9629, 20.5937] };

const resolveLocationGeometry = async (location) => {
    if (!mapToken) {
        console.warn("Mapbox token not set; using default geometry.");
        return DEFAULT_GEOMETRY;
    }
    try {
        const response = await geocodingClient.forwardGeocode({
            query: location,
            limit: 1,
        }).send();
        if (response.body.features && response.body.features.length > 0) {
            return response.body.features[0].geometry;
        }
        console.warn("Mapbox returned no coordinates; using default geometry.");
        return DEFAULT_GEOMETRY;
    } catch (err) {
        console.error("Mapbox geocoding failed:", err.message || err);
        return DEFAULT_GEOMETRY;
    }
};
// -------------------------------------------------------------------

// 1. Index Route Logic
module.exports.index = async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index", { alllistings });
};

// 2. Render New Form Logic
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// 3. Show Route Logic
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author", 
            },
        })
        .populate("owner");
        
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// 4. Create Route Logic (CORRECTED WITH API FALLBACK SAFETY)
module.exports.createListing = async (req, res, next) => {
    try {
        if (!req.file) {
            req.flash("error", "Please upload an image to create your listing.");
            return res.redirect("back");
        }

        const geometry = await resolveLocationGeometry(req.body.listing.location);
        const newlisting = new Listing(req.body.listing);
        newlisting.owner = req.user._id;
        newlisting.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
        newlisting.geometry = geometry;

        let savedListing = await newlisting.save();
        console.log(savedListing); 

        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
       console.log("======== ERROR DETECTED ON CREATION ========");
        console.error(err); // This line forces the terminal to print the exact problem
        console.log("============================================");
        next(err);
    }
};

// 5. Edit Route Logic
module.exports.renderEditForm = async (req, res, next) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }

        let originalImageUrl = listing.image.url;
        let previewImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

        res.render("listings/edit", { listing, previewImageUrl });
    } catch (err) {
        next(err);
    }
};

// 6. Update Route Logic
module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;
        
        let listing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { runValidators: false, new: true }
        );

        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
            await listing.save();
        }

        req.flash("success", "Listing Updated!"); 
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

// 7. Delete Route Logic
module.exports.destroyListing = async (req, res, next) => {
    try {
        let { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted!"); 
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};