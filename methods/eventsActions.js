const Events = require("../models/events");
const Rounds = require("../models/events");
const Users = require("../models/user");
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');



var functions = {
    createEvent : async function(req,res){
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token,config.secret);
        var getUserData = await Users.findOne({email:decodeToken});
        var getStatus;
        if(!(req.body.status) || req.body.status == ""){
          getStatus = "open";
        }
        else{
          getStatus = req.body.status;
        }
        
    
        var createEvent = Events({
            title : req.body.title,
            type : req.body.type,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            description :req.body.description,
            eventPrice : req.body.eventPrice,
            status : getStatus,
            createdBy : [getUserData.id]
        });
    
          createEvent.save(async function(err,newEvent){
              if(err){
                  return res.status(400).json({msg: err});
              }
              else{ 
                  var eventData = createEvent;
                  var event = await Events.find({_id : eventData.id}).populate({path: "createdBy"});
    
                return res.status(200).json({event});
    
              }
          });
      },

    createRounds : async function(req,res){
          if((!req.body.roundNumber)||(!req.body.testType)||(!req.body.lab)||(!req.body.date)||(!req.body.eventID)){
            res.json({success:false,msg: "Enter all fields"});
            return;
          }
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token,config.secret);
        var getUserData = await Users.findOne({email:decodeToken});
        var getlastRound;

        var eventID = req.body.eventID;
        if((!req.body.lastRound)){
          getlastRound = false;
        }
        else{
          getlastRound = req.body.lastRound;

        }
        var createRound = {
            lab : req.body.lab,
            date : req.body.date,
            roundNumber : req.body.roundNumber,
            testType : req.body.testType,
            lastRound : getlastRound

        };
        var storeRound = await Events.findOne({_id : eventID});
        if(!storeRound){
          return res.status(400).json({msg:"Events not found"});
         }
        storeRound.rounds.push(createRound);
              await  storeRound.save();
        return res.status(200).json(storeRound);

      },


    selectedStudends : async function(req,res){
        if((!req.body.eventID) || (!req.body.roundID)){
          return  res.json({success:false,msg: "Enter all fields"});
        }

        var eventID = req.body.eventID;
        var roundID = req.body.roundID;
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token,config.secret);
        var getUserData = await Users.findOne({email:decodeToken});

        var studendData = {
          email :getUserData.email,
          name : getUserData.name,
          systemID : getUserData.systemID,
          type : getUserData.type,
          course : getUserData.course,
          year: getUserData.year,
          semester : getUserData.semester,
          gender: getUserData.gender,
      };

        var getEvent =  await Events.findOne({_id : eventID});
        if(!getEvent){
          return res.status(400).json({msg:"Events not found"});
         }

        if(getEvent.status == "open"){
        for(var i =0 ; i < getEvent.rounds.length ; i++){
          if(getEvent.rounds[i]._id == roundID){
            for(var j =0 ; j < getEvent.rounds[i].selectedStudends.length; j++){
              if(getEvent.rounds[i].selectedStudends[j].email == getUserData.email ||
                 getEvent.rounds[i].selectedStudends[j].systemID == getUserData.systemID){
                return res.status(400).json({msg : "Already Registered"});
              }
            }
          await getEvent.rounds[i].selectedStudends.push(studendData); 
          await  getEvent.save(); 
          }
        }
      }
      else{
        return res.status(400).json({msg: "Event Close" });
      }
      return res.status(200).json(getEvent);   

       

      },

    applyEvent : async function(req,res){
        if((!req.body.eventID)){
          return  res.status(400).json({success:false,msg: "Enter all fields"});
        }
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token,config.secret);
        var getUserData = await Users.findOne({email:decodeToken});
        var eventID = req.body.eventID;

        var studendData = {
          email :getUserData.email,
          name : getUserData.name,
          systemID : getUserData.systemID,
          type : getUserData.type,
          course : getUserData.course,
          year: getUserData.year,
          semester : getUserData.semester,
          gender: getUserData.gender,
      };

        var getEvent =  await Events.findOne({_id : eventID});
        if(!getEvent){
          return res.status(400).json({msg:"Events not found"});
         }

        if(getEvent.status == "open"){
          for(var j =0 ; j < getEvent.appliedStudents.length; j++){
            if(getEvent.appliedStudents[j].email == getUserData.email ||
               getEvent.appliedStudents[j].systemID == getUserData.systemID){
              return res.status(400).json({msg : "Already Registered"});
               }
          }   
          await getEvent.appliedStudents.push(studendData);
          getEvent.save();
      }
      else{
        return res.status(400).json({msg: "Event Close" });
      }
      return res.status(200).json(getEvent); 

      },


      getAllEvents : async function(req,res){
        var allEvents = await Events.find({}).populate({path : "createdBy"});
        return res.status(200).json({events : allEvents});
     },



     getEventRound : async function(req,res){

       var eventID = req.body.eventID;

       var getEvent = await Events.findOne({_id : eventID});
       if(!getEvent){
        return res.status(400).json({msg:"Events not found"});
       }
       var getRound = getEvent.rounds;


       return res.status(200).json(getRound);
     },
     
     
     getSingletRound : async function(req,res){

       var eventID = req.body.eventID;
       var roundID = req.body.roundID; 
       var getRound;
       var getEvent = await Events.findOne({_id : eventID});
       for(var i =0 ; i < getEvent.rounds.length ; i++){
        if(getEvent.rounds[i]._id == roundID){
        getRound = getEvent.rounds[i];
        
      }
    }
       return res.status(200).json(getRound);
     },

     closeEvent : async function(req,res){
       if(!req.body.eventID){
         res.status(400).json({msg:"Enter Event ID"});
       }

       var closeEvent = await Events.findOneAndUpdate({_id : req.body.eventID},{status : "close"});
       if(!closeEvent){
         return res.status(400).json({msg:"Events not found"});
       }
       await closeEvent.save();
       res.status(200).json({msg : "Event Close" , event : {id : req.body.eventID, title : closeEvent.title}});
     }
};

module.exports = functions;