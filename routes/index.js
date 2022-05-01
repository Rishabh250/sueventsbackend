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

//Get Single User
router.get("/getSingleUser",actions.singleUser);

// Post user Image
// router.post("/uploadImage",actions.uploadImage);

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

//Send OTP
router.post("/sendOTP",actions.sendOTP);

//Verify OTP
router.post("/verifyOTP",actions.verifyOTP);

//Student Apply
router.post("/applyEvent",events.applyEvent);

//Selected Students or Attendence
router.post("/selectedStudents",events.selectedStudends);

//Event Round
router.post("/getEventRound",events.getEventRound);

//Single Round
router.post("/getSingleRound",events.getSingletRound);

//Close Event
router.post("/closeEvent",events.closeEvent);



module.exports = router;