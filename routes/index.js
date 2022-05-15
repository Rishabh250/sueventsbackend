const express = require("express");
const actions = require('../methods/studentActions');
const events = require('../methods/eventsActions');
const faculty = require('../methods/facultyActions');
const router = express.Router();


router.get('/', (req, res) => {
    res.send("Connected");

});

//Student API


//Register User
router.post("/createUser", actions.addNew);

//Login User
router.post("/loginUser", actions.authorization);

//Get Single User
router.get("/getSingleUser", actions.singleUser);

// Post user Image
router.post("/uploadImage", actions.uploadImage);

//Get Single User Info
router.get("/userInfo", actions.getUserInfo);

//Get All User Data
router.get("/getAllUser", actions.getAllUser);

//Forget Password
router.post("/forgetPassword", actions.forgetPassword);

//Send OTP
router.post("/sendOTP", actions.sendOTP);

//Verify OTP
router.post("/verifyOTP", actions.verifyOTP);

//Student Apply
router.post("/applyEvent", events.applyEvent);

//Student Events
router.get("/studentEvents", actions.getStudentEvents);


//Faculty API

//Faculty Create User
router.post("/createFaculty", faculty.addNew);

router.post("/facultyloginUser", faculty.authorization);

//Get Single User
router.get("/facultygetSingleUser", faculty.singleUser);

// Post user Image
router.post("/facultyuploadImage", faculty.uploadImage);

//Get Single User Info
router.get("/facultyuserInfo", faculty.getUserInfo);

//Get All User Data
router.get("/facultygetAllUser", faculty.getAllUser);

//Forget Password
router.post("/facultyforgetPassword", faculty.forgetPassword);

//Send OTP
router.post("/facultysendOTP", faculty.sendOTP);

//Verify OTP
router.post("/facultyverifyOTP", faculty.verifyOTP);





// Event API

//Create Event
router.post("/createEvent", events.createEvent);

//Get All Events
router.get("/getAllEvents", events.getAllEvents);

//Store Rounds
router.post("/createRound", events.createRounds);

//Selected Students or Attendence
router.post("/selectedStudents", events.selectedStudends);

//Event Round
router.post("/getEventRound", events.getEventRound);

//Single Round
router.post("/getSingleRound", events.getSingletRound);

//Close Event
router.post("/closeEvent", events.closeEvent);



module.exports = router;