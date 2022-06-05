const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

const facultySchema = new Schema({

    email: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    password: { type: String, require: true },
    systemID: { type: String, require: true, unique: true },
    type: { type: String, require: true },
    gender: { type: String, required: true },
    profileImage: {
        type: String
    },
    otp: { type: Number },
    eventsCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events"
    }],
    assignedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events"
    }]


});

facultySchema.methods.comparePassword = function(pass, cb) {
    bcrypt.compare(pass, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("Faculty", facultySchema);