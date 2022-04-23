const Users = require("../models/user");
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
const { authorization } = require("passport/lib");

var functions = {
  addNew: function (req,res){
      type = req.body.type;
      if( type == "Student"){
        checkEmail =req.body.email.split(".");
        if((checkEmail[0].length != 10) ){
            res.status(400).send("Invalid email id");
            return;
        }
      }
      


    if((!req.body.name)||(!req.body.password)||(!req.body.email||(!req.body.systemID)||(!req.body.type))) {
        res.json({success:false,msg: "Enter all fields"});
        return;

    }
    else if(!(req.body.email).includes("@") || !(req.body.email).includes("sharda")){
        res.status(400).send("Invalid email id");
        return;

    }
    
    else if((req.body.password).length < 6){
        res.status(400).send("Password length must be greater than 6");
        return;
    }

    else if((req.body.systemID).length != 10){
        res.status(400).send("Invalid System ID");
        return;

    }
    else if((req.body.type != "Student") && (req.body.type != "Faculty")){
      console.log(req.body.type);
        res.status(400).send("Invalid Details");
        return;
    }

    else{

     
        Users.findOne({email: req.body.email}).then((err)=>{
            if(err){
                res.status(400).send("email already exits");
                return;
}
else{
    var newUser = Users({
        email : req.body.email,
        name : req.body.name,
        password : req.body.password,
        systemID : req.body.systemID,
        type : req.body.type
    });
  newUser.save(function(err,newUser){
      if(err){
          res.status(400).json({success: false,msg:"Failed to save"});
      }
      
      else{

        var token = jwt.encode(req.body.email,config.secret);
        res.json({success: "User Registered",token : token,user:{email:req.body.email,name : req.body.name,systemID: req.body.systemID,password : req.body.password}});

    }
      
  });
}
        });
      
    }
  },

  authorization : function(req,res){
      Users.findOne({
          email:req.body.email
      } ,function(err,user){
          if(err){
              throw err;
          }
          if(!user){
              res.status(403).send({success:false,msg:"user not found"});
          }
          else{
              user.comparePassword(req.body.password,function(err,isMatch){
                  if(isMatch && !err){
                     var token  = jwt.encode(user.email,config.secret);
                     res.json({success:true,token:token});
                     return;
                  }
                  else{
                      return res.status(403).send({success:false,msg:"Password wrong"});
                  }
              });
          }
      });
  },
  getUserInfo :async function(req,res) {
      if(req.headers["x-access-token"]){
          var token = req.headers["x-access-token"];
          var decodeToken = jwt.decode(token,config.secret);
          var getUserData = await Users.findOne({email:decodeToken});
          return res.json({success:"User Info",user: {email :getUserData.email,name :getUserData.name,systemID :getUserData.systemID,password :getUserData.password} });
      }

      else{
        return res.json({success:false,msg:'No Found' });

      }
  },

  getAllUser : async function(req,res){
    var getAllUserData = await Users.find({});
    return res.json({"user" : getAllUserData});
  }
};




module.exports = functions;