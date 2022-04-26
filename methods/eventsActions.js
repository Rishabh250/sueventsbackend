const Events = require("../models/events");
const Rounds = require("../models/events");
const Users = require("../models/user");
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
const res = require("express/lib/response");



var functions = {
    createEvent : async function(req,res){
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token,config.secret);
        var getUserData = await Users.findOne({email:decodeToken});
        var price;
        
    
        var createEvent = Events({
            title : req.body.title,
            type : req.body.type,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            description :req.body.description,
            eventPrice : req.body.eventPrice,
            createdBy : [getUserData.id],
        });
    
          createEvent.save(async function(err,newEvent){
              if(err){
                  return res.status(400).json({msg: err});
              }
              else{ 
                  var eventData = createEvent;
                  var store = await Events.find({_id : eventData.id}).populate({path: "createdBy"});
    
                return res.status(200).json({store});
    
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
        storeRound.rounds.push(createRound);
              await  storeRound.save();
        return res.status(200).json(storeRound);

      },


      getAllEvents : async function(req,res){
        var allEvents = await Events.find({}).populate({path : "createdBy"});
        return res.status(200).json({events : allEvents});
     },
};

module.exports = functions;