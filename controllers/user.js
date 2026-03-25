const User = require("../models/user.js");

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const normalizePhone = (phone) => {
    if (!phone || typeof phone !== "string") return "";
    return phone.trim().replace(/[\s-]+/g, "");
};

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, phone } = req.body;
        const normalizedPhone = normalizePhone(phone);

        if (!PHONE_REGEX.test(normalizedPhone)) {
            req.flash("error", "Please provide a valid mobile number (10-15 digits)");
            return res.redirect("/users/signup");
        }

        const newUser = new User({ email, username, phone: normalizedPhone });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Revalto!");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/users/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

module.exports.profile = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/listings");
    }
    res.render("users/profile.ejs", { user });
};
