const User = require("../models/user");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};


module.exports.signup = async (req, res, next) => {
    console.log("--- 1. SIGNUP BUTTON CLICKED ---");
    console.log("2. Data received from form:", req.body);
    
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        
        console.log("3. Attempting to register user with Passport...");
        const registeredUser = await User.register(newUser, password);
        
        console.log("4. User registered successfully:", registeredUser.username);
        
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("❌ LOGIN ERROR:", err);
                return next(err);
            }
            console.log("5. User logged in, redirecting to /listings...");
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        console.error("❌ 6. SIGNUP ERROR CAUGHT:", e.message);
        req.flash("error", e.message);
        
        req.session.save(() => {
            res.redirect("/signup");
        });
    }
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};