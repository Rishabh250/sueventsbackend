const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var roundSchema = new Schema({
    topic : {type : String,required : true},
    date : {type: String , required: true},
    studentsApplied : [],
});

module.exports = mongoose.model("Rounds",roundSchema);
