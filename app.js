if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/express_error.js");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js")

// Route imports
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const mongo_url = "mongodb://127.0.0.1:27017/test";

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongo_url);
}

// View engine & middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser("revaltoSecretKey123"));

// Session config
const sessionOptions = {
    secret: "revaltoSecretKey123",
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
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash messages available to all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Root
app.get("/", (req, res) => {
    res.send("hi am the root ");
});

// Demo cookie routes
app.get("/setcookie", (req, res) => {
    res.cookie("username", "RevaltoUser", {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.cookie("theme", "dark", {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.send("Cookies have been set! <a href='/getcookie'>View Cookies</a>");
});

app.get("/getcookie", (req, res) => {
    res.send(req.cookies);
});

app.get("/clearcookie", (req, res) => {
    res.clearCookie("username");
    res.clearCookie("theme");
    res.send("Cookies cleared! <a href='/getcookie'>Verify</a>");
});

// Routes
app.use("/users", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

// 404 - Page Not Found
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message, statusCode });
});

app.listen(8088, () => {
    console.log("port was listening on the 8088 ");
});