const express = require("express");
const actions = require('../methods/action');
const events = require('../methods/eventsActions');
const router = express.Router();


router.get('',(req,res)=>{
    res.send("Connected");

});
router.get('/user',(req,res)=>{
    res.send("Rishabh");

});

//Register User
router.post("/createUser",actions.addNew);

//Login User
router.post("/loginUser",actions.authorization);

//Get Single User Info
router.get("/userInfo",actions.getUserInfo);

//Get All User Data
router.get("/getAllUser",actions.getAllUser);

//Forget Password
router.post("/forgetPassword",actions.forgetPassword);

//Create Event
router.post("/createEvent",events.createEvent);

//Get All Events
router.get("/getAllEvents",events.getAllEvents);

//Store Rounds
router.post("/createRound",events.createRounds);

module.exports = router;