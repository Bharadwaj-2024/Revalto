const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\+?[0-9]{10,15}$/, "Please enter a valid mobile number"],
    },
});

// passport-local-mongoose adds username, hash, salt fields automatically
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);