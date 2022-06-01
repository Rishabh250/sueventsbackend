const Events = require("../models/events");
const Rounds = require("../models/events");
const Users = require("../models/student");
const Faculty = require("../models/faculty");
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
const { json } = require("body-parser");



var functions = {
    createEvent: async function(req, res) {
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        var token = req.headers["x-access-token"];

        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Faculty.findOne({ email: decodeToken });
        var getStatus;
        if (!(req.body.status) || req.body.status == "") {
            getStatus = "open";
        } else {
            getStatus = req.body.status;
        }


        var createEvent = Events({
            title: req.body.title,
            type: req.body.type,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            description: req.body.description,
            eventPrice: req.body.eventPrice,
            status: getStatus,
            createdBy: [getUserData.id]
        });

        createEvent.save(async function(err, newEvent) {
            if (err) {
                return res.status(400).json({ msg: err });
            } else {
                var eventData = createEvent;
                var event = await Events.find({ _id: eventData.id }).populate({ path: "createdBy" });
                var addEventatFaculty = await Faculty.findOne({ _id: getUserData.id });
                await addEventatFaculty.eventsCreated.push(eventData.id);
                await addEventatFaculty.save();
                return res.status(200).json({ event });

            }
        });
    },

    createRounds: async function(req, res) {
        if ((!req.body.testType) || (!req.body.lab) || (!req.body.date) || (!req.body.eventID)) {
            res.status(400).json({ success: false, msg: "Enter all fields" });
            return;
        }
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Users.findOne({ email: decodeToken });
        var getlastRound;

        var eventID = req.body.eventID;
        if ((!req.body.lastRound)) {
            getlastRound = false;
        } else {
            getlastRound = req.body.lastRound;

        }
        var storeRound = await Events.findOne({ _id: eventID });
        // console.log(await storeRound.studentLeft)
        var updateStudentList =   await Events.findOneAndUpdate({_id: eventID}, { $set : {  studentLeft: [] }}, {multi:true});
        updateStudentList.save();
          console.log(storeRound)  
        var createRound = {
            lab: req.body.lab,
            date: req.body.date,
            status : "open",
            roundNumber: storeRound.rounds.length +1,
            testType: req.body.testType,
            lastRound: getlastRound

        };
        if (!storeRound) {
            return res.status(400).json({ msg: "Events not found" });
        }
        if (storeRound.status == "close") {
            return res.status(400).json({ msg: "Event Closed" });
        }

        if(storeRound.rounds.length > 0){

            let selectselectedStudends = storeRound.rounds[storeRound.rounds.length -1].selectedStudends;

            if(selectselectedStudends.length === 0){
                storeRound.rounds[storeRound.rounds.length -1].set({status : "close"});
                await storeRound.rounds.push(createRound);
                await storeRound.save();
                return res.status(200).json(storeRound)
            }

           let closeEvent = storeRound.rounds[storeRound.rounds.length -1].set({status : "close"});
            console.log(selectselectedStudends)
            if(selectselectedStudends !== []){
                var getAllSelectedStudents = Array.from(selectselectedStudends)
                await storeRound.studentLeft.push(getAllSelectedStudents)    
            } 

            await  storeRound.rounds.push(createRound);

            var getAllstudentLeft = Array.from(storeRound.studentLeft);
            var newRound = storeRound.rounds[storeRound.rounds.length -1].unselectedStudends;
            await newRound.push(getAllstudentLeft);

            await storeRound.save();
    }
    else{
        await storeRound.rounds.push(createRound);
        await storeRound.save();


    }
    
        return res.status(200).json(storeRound);

    },


    selectedStudends: async function(req, res) {
        if ((!req.body.eventID) || (!req.body.roundID)) {
            return res.json({ success: false, msg: "Enter all fields" });
        }
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        var eventID = req.body.eventID;
        var roundID = req.body.roundID;
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Users.findOne({ email: decodeToken });


        var getEvent = await Events.findOne({ _id: eventID });
        if (!getEvent) {
            return res.status(400).json({ msg: "Events not found" });
        }

        var round = 0;

        if (getEvent.status == "open") {
            console.log(getEvent.rounds.length);
            for (var i = 0; i < getEvent.rounds.length; i++) {
                if (getEvent.rounds[i]._id == roundID) {
                    round++;
                    for (var j = 0; j < getEvent.rounds[i].selectedStudends.length; j++) {
                        if (getEvent.rounds[i].selectedStudends[j] == getUserData.id) {
                            return res.status(400).json({ msg: "Already Registered" });
                        }
                    }
                var rrr =   getEvent.rounds[i].unselectedStudends.pull({_id : getUserData.id})
                console.log(rrr)
                console.log(getEvent.rounds[i].unselectedStudends);
                await getEvent.rounds[i].selectedStudends.push(getUserData.id);
                await getEvent.save();
                }
            }
        } else {
            return res.status(400).json({ msg: "Event Close" });
        }
        if (round == 0) {

            return res.status(400).json({ msg: "Invalid Round ID" });

        }
        return res.status(200).json(getEvent);



    },

    applyEvent: async function(req, res) {
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        if ((!req.body.eventID)) {
            return res.status(400).json({ success: false, msg: "Enter all fields" });
        }
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        var token = req.headers["x-access-token"];



        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Users.findOne({ email: decodeToken });
        var eventID = req.body.eventID;

        var getEvent = await Events.findOne({ _id: eventID });
        if (!getEvent) {
            return res.status(400).json({ msg: "Events not found" });
        }

        if (getEvent.status == "open") {
            for (var j = 0; j < getEvent.appliedStudents.length; j++) {
                if (getEvent.appliedStudents[j] == getUserData.id ) {
                    return res.status(400).json({ msg: "Already Registered" });
                }
            }
            var storeID = [
                getEvent._id
            ];

            var getUser = await Users.findOne({ email: getUserData.email });
            await getUser.events.push(storeID);
            getUser.save();
            await getEvent.appliedStudents.push(getUserData);
            await getEvent.studentLeft.push(getUserData);
            await getEvent.rounds[0].unselectedStudends.push(getUserData);
            getEvent.save();
        } else {
            return res.status(400).json({ msg: "Event Close" });
        }
        
        return res.status(200).json(getEvent);

    },




    getAllEvents: async function(req, res) {
        var allEvents = await Events.find({ status: "open" }).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" });
        return res.status(200).json({ events: allEvents });
    },

    singleEvent: async function(req, res) {
        if ((!req.body.eventID)) {
            return res.status(400).json({ success: false, msg: "Required Event ID" });
        }
        let eventID = req.body.eventID;
        var allEvents = await Events.findOne({_id : eventID}).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" }).populate({path : "appliedStudents"});
        return res.status(200).json({ events: allEvents });
    },



    getEventRound: async function(req, res) {

        var eventID = req.body.eventID;

        var getEvent = await Events.findOne({ _id: eventID });
        if (!getEvent) {
            return res.status(400).json({ msg: "Events not found" });
        }
        var getRound = getEvent.rounds;


        return res.status(200).json(getRound);
    },


    getSingleRound: async function(req, res) {

        var eventID = req.body.eventID;
        var roundID = req.body.roundID;
        var getRound;
        var getEvent = await Events.findOne({ _id: eventID }).populate({path : "rounds.selectedStudends"});
        for (var i = 0; i < getEvent.rounds.length; i++) {
            if (getEvent.rounds[i]._id == roundID) {
                getRound = getEvent.rounds[i];

            }
        }
        return res.status(200).json(getRound);
    },

    closeEvent: async function(req, res) {
        if (!req.body.eventID) {
            res.status(400).json({ msg: "Enter Event ID" });
        }

        var closeEvent = await Events.findOneAndUpdate({ _id: req.body.eventID }, { status: "close" });
        if (!closeEvent) {
            return res.status(400).json({ msg: "Events not found" });
        }
        await closeEvent.save();
        res.status(200).json({ msg: "Event Close", event: { id: req.body.eventID, title: closeEvent.title } });
    },

    compareEvents : async function(req,res){
        let events = ["6293acf3134818f700152781","6294c4a0a57789476d15afc4","6294c4a0a51789476d15afc4"];
        let round = "Aptitude Test"
        let compareEvents = [];
        var getRound;
        
        for(let k=0 ;k < events.length ;k++){
            var getEvent = await Events.findOne({ _id: events[k] });
            for (var i = 0; i < getEvent.rounds.length; i++) {
                if (getEvent.rounds[i].testType == round) {
                    getRound = getEvent.rounds[i].selectedStudends;

                    for(var j =0 ; j < getRound.length ; j++){
                        compareEvents.push(getRound[j]);
                    }
                }
               
            }
        }

        compareEvents = compareEvents.filter((value, index, self) =>
         index === self.findIndex((t) => (
        t.email === value.email && t.email === value.email
        ))
    )

    return res.status(200).json(compareEvents);
    }


};

module.exports = functions;