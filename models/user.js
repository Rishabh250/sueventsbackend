const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
const Events = require("./events");



var userSchema =new Schema({

    email:{type :String,require:true, unique : true},
    name: {type : String,require :true},   
    password:{type:String,require:true},
    systemID:{type:String,require:true,unique : true},
    type : {type : String,require:true},
    course : {type : String,required:true},
    semester : {type : Number,required:true},
    year : {type : Number,required:true},
    gender : {type : String,required:true},
    profileImage :{
        type : String},
    otp : {type : Number},
    events :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Events"
    }]
    
   
});

userSchema.methods.comparePassword = function(pass,cb){
    bcrypt.compare(pass,this.password,function(err,isMatch){
        if(err){
            return cb(err);
        }
        cb(null,isMatch);
    }   );
};
module.exports = mongoose.model("User",userSchema);