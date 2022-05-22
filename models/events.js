const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");


var eventSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    eventPrice: { type: String, required: true },
    facultyAssigned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    }],
    appliedStudents: [{
        email: { type: String },
        name: { type: String },
        gender: { type: String },
        systemID: { type: String },
        type: { type: String },
        course: { type: String },
        semester: { type: Number },
        year: { type: Number },
        userImage: { type: String },
    }],

    rounds: [{

        roundNumber: { type: Number },
        lab: { type: String },
        testType: { type: String },
        date: { type: String },
        lastRound: { type: Boolean },
        selectedStudends: [{
            email: { type: String },
            name: { type: String },
            gender: { type: String },

            systemID: { type: String },
            type: { type: String },
            course: { type: String },
            semester: { type: Number },
            year: { type: Number },
            userImage: { type: String },
        }]
    }],
    createdBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    }]

});



module.exports = mongoose.model("Events", eventSchema);