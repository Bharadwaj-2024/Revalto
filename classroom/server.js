const express = require("express");
const session = require("express-session");
const app = express();

const sessionOptions = {
    secret: "mysuperscertstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
};

app.use(session(sessionOptions));

app.get("/test", (req, res) => {
    if (!req.session.count) {
        req.session.count = 1;
    } else {
        req.session.count++;
    }
    res.send(`Test successful! Visit count: ${req.session.count}`);
});

app.get("/check", (req, res) => {
    res.send(req.session);
});

app.listen(3000, () => {
    console.log("server was listening to 3000");
});