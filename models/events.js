const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");


var eventSchema = new Schema({
    title : {type : String,required :true},
    type : {type : String,required :true},
    description :{type : String,required :true},
    startDate : {type: String , required :true},
    endDate : {type : String},
    eventPrice : {type : String,required :true},
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
