const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares.js");
const UserController = require("../controllers/user.js");

// Async error wrapper
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Signup
router.get("/signup", UserController.renderSignupForm);
router.post("/signup", wrapAsync(UserController.signup));

// Login
router.get("/login", UserController.renderLoginForm);
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true,
    }),
    UserController.login
);

// Logout
router.get("/logout", UserController.logout);

// Profile
router.get("/:id", wrapAsync(UserController.profile));

module.exports = router;
