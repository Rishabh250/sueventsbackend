const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");


var eventSchema = new Schema({
    title : {type : String,},
    type : {type : String,},
    description :{type : String,},
    startDate : {type: String , },
    endDate : {type : String,},
    rounds : [
       {
           
            roundNumber : {type : Number},
            lab : {type : String},
            testType : {type : String},
            date : {type:String},
            lastRound : {type : Boolean}
        } 
    ],
    createdBy : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }]
    
});



module.exports = mongoose.model("Events",eventSchema);
