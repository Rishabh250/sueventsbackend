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
    registration : {type : Boolean},
    eventPrice: { type: String, required: true },
    facultyAssigned: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    }],
    appliedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],  
    
    studentLeft: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    rounds: [{

        roundNumber: { type: Number },
        status :{type : String},
        lab: { type: String },
        testType: { type: String },
        date: { type: String },
        time: { type: String },
        lastRound: { type: Boolean },
        showQRCode : {type : Boolean},

        totalStudent : [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }],

        unselectedStudends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }],
        selectedStudends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }],

        absent: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }],
        present: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }]
    }],
    createdBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    }]

});



module.exports = mongoose.model("Events", eventSchema);