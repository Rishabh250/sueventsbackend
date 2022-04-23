const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");



var userSchema =new Schema({

    email:{type :String,require:true},
    name: {type : String,require :true},   
    password:{type:String,require:true},
    systemID:{type:String,require:true,},
    type : {type : String,require:true}

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