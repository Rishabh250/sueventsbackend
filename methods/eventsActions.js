const Events = require("../models/events");
const Rounds = require("../models/events");
const Users = require("../models/student");
const Faculty = require("../models/faculty");
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
const { json } = require("body-parser");

var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

var functions = {
    createEvent: async function(req, res) {
        try{
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
                createdBy: [getUserData.id],
                registration : "true"
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
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    },

    createRounds: async function(req, res) {
       try{
        if ((!req.body.testType) || (!req.body.lab) || (!req.body.date) || (!req.body.eventID)|| (!req.body.time)) {
            res.status(400).json({ success: false, msg: "Enter all fields" });
            return;
        }
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Faculty.findOne({ email: decodeToken });
        var getlastRound;

        var eventID = req.body.eventID;
        if ((!req.body.lastRound)) {
            getlastRound = false;
        } else {
            getlastRound = req.body.lastRound;

        }
        var storeRound = await Events.findOne({ _id: eventID });
        if(!storeRound){
            return res.status(400).json({msg : "Event not found"})
        }
        if(storeRound.status === "close"){
            return res.status(400).json({msg : "Event close"})
        }
        await storeRound.set({studentLeft: [] });
        await storeRound.save();


        var createRound = {
            lab: req.body.lab,
            date: req.body.date,
            time : req.body.time,
            status : "open",
            roundNumber: storeRound.rounds.length +1,
            testType: req.body.testType,
            lastRound: getlastRound,
            showQRCode: "false",

        };
        if (!storeRound) {
            return res.status(400).json({ msg: "Events not found" });
        }
        if (storeRound.status == "close") {
            return res.status(400).json({ msg: "Event Closed" });
        }

        if(storeRound.rounds.length > 0){

            let selectPresent = storeRound.rounds[storeRound.rounds.length -1].present;

            if(selectPresent.length === 0){
               await  storeRound.rounds[storeRound.rounds.length -1].set({status : "close"});
               await  storeRound.rounds[storeRound.rounds.length -1].set({showQRCode : "false"});
                await storeRound.rounds[storeRound.rounds.length -1].set({showQRCode : false});
                await storeRound.rounds.push(createRound);
                await storeRound.save();
                return res.status(200).json(storeRound)
            }

           await storeRound.rounds[storeRound.rounds.length -1].set({status : "close"});
           await  storeRound.rounds[storeRound.rounds.length -1].set({showQRCode : "false"});
            if(selectPresent !== []){

                var getAllSelectedStudents = Array.from(selectPresent)
                for(var k =0 ; k <getAllSelectedStudents.length ;k++){
                    await storeRound.studentLeft.push(getAllSelectedStudents[k])  

                }
                await storeRound.save();
            } 

            await  storeRound.rounds.push(createRound);
            let stdList = storeRound.studentLeft;
            var getAllstudentLeft = Array.from(stdList);
            
            let newRound = storeRound.rounds[storeRound.rounds.length -1];
            for(var k =0 ; k <getAllSelectedStudents.length ;k++){
                await newRound.absent.push(getAllstudentLeft[k]);
                await newRound.totalStudent.push(getAllstudentLeft[k]);
 

            }
    }
    else{
        await storeRound.rounds.push(createRound);
        await storeRound.save();
    }
        await storeRound.save();
        return res.status(200).json(storeRound);
       }
       catch(e){
        console.log(e)
        return res.status(403).json({msg : "Something went wrong"})       }
    },


    selectedStudends: async function(req, res) {
        try{
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
                        for (var j = 0; j < getEvent.rounds[i].present.length; j++) {
                            if (getEvent.rounds[i].present[j] == getUserData.id) {
                                return res.status(400).json({ msg: "Already Registered" });
                            }
                        }
                    await getEvent.rounds[i].absent.pull(getUserData.id)
                    await getEvent.rounds[i].present.push(getUserData.id);
                    await getEvent.rounds[i].unselectedStudends.push(getUserData.id);
                    
                    if(getEvent.rounds.length > 1){
                      await  getEvent.rounds[i-1].selectedStudends.push(getUserData.id);
                      await  getEvent.rounds[i-1].unselectedStudends.pull(getUserData.id);
                    }
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
    
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }

    },

    applyEvent: async function(req, res) {
       try{
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

        if (getEvent.registration === true) {
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
            await getEvent.rounds[0].absent.push(getUserData);
            await getEvent.rounds[0].totalStudent.push(getUserData);
            getEvent.save();
        } else {
            return res.status(400).json({ msg: "Registration Close" });
        }
        
        return res.status(200).json(getEvent);

      }
      catch(e){
        console.log(e)
        return res.status(403).json({msg : "Something went wrong"})      }
    },




    getPlacementEvents: async function(req, res) {
       try{
        var time = 10;
        var getHours= new Date().getHours().toLocaleString();
        var todayDate = new Date().toISOString().slice(0, 10).toString().split("-");

        var allEvents = await Events.find({ status: "open", type : "Placement Event" }).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" });
        
        for(var i =0 ;i < allEvents.length;i++ ){
            var date = allEvents[i].startDate;
            var finalDate = todayDate[2] +" "+ months[Number(todayDate[1]-1)]+", "+ todayDate[0]
            
            console.log(new Date(date))

            if(new Date(finalDate) >= new Date(date) && Number(getHours) >= Number(time) ){
                await allEvents[i].set({registration:"false"});
               await allEvents[i].save();
            }
        }

        allEvents.sort(function(a, b) {
            var c = new Date(a.startDate);
            var d = new Date(b.startDate);
       
            return c-d;
        });
       
        return res.status(200).json({ events: allEvents });
       }
       catch(e){
        console.log(e)
        return res.status(403).json({msg : "Something went wrong"})       }
    },
    
    getAllEvents: async function(req, res) {
       try{
        var time = 10;
        var getHours= new Date().getHours().toLocaleString();
        var todayDate = new Date().toISOString().slice(0, 10).toString().split("-");

        var allEvents; 
        if(req.params.title){
            allEvents = await Events.find({"$or" : [{status : "open" ,title : {$regex:req.params.title }}]} ).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" });
            
            for(var i =0 ;i < allEvents.length;i++ ){
                var date = allEvents[i].startDate;
                var finalDate = todayDate[2] +" "+ months[Number(todayDate[1]-1)]+", "+ todayDate[0]
                
                console.log(new Date(date))
    
                if(new Date(finalDate) >= new Date(date) && Number(getHours) >= Number(time) ){
                    await allEvents[i].set({registration:"false"});
                   await allEvents[i].save();
                }
            }
            
            allEvents.sort(function(a, b) {
                var c = new Date(a.startDate);
                var d = new Date(b.startDate);
           
                return c-d;
            });
        }
        if(req.params.title === " "){
            
            allEvents = await Events.find({status : "open"}).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" });

            for(var i =0 ;i < allEvents.length;i++ ){
                var date = allEvents[i].startDate;
                var finalDate = todayDate[2] +" "+ months[Number(todayDate[1]-1)]+", "+ todayDate[0]
                
                console.log(new Date(date))
    
                if(new Date(finalDate) >= new Date(date) && Number(getHours) >= Number(time) ){
                    await allEvents[i].set({registration:"false"});
                   await allEvents[i].save();
                }
            }
            
            allEvents.sort(function(a, b) {
                var c = new Date(a.startDate);
                var d = new Date(b.startDate);
           
                return c-d;
            });

        }

        
        return res.status(200).json({ events: allEvents });
       }
       catch(e){
        console.log(e)
        return res.status(403).json({msg : "Something went wrong"})       }
    },
    
    getGeneralEvents: async function(req, res) {
       try{
        var time = 10;
        var getHours= new Date().getHours().toLocaleString();
        var todayDate = new Date().toISOString().slice(0, 10).toString().split("-");

        var allEvents = await Events.find({ status: "open", type : "General Event" }).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" });
        
        for(var i =0 ;i < allEvents.length;i++ ){
            var date = allEvents[i].startDate;
            var finalDate = todayDate[2] +" "+ months[Number(todayDate[1]-1)]+", "+ todayDate[0]
            
            console.log(new Date(date))

            if(new Date(finalDate) >= new Date(date) && Number(getHours) >= Number(time) ){
                await allEvents[i].set({registration:"false"});
               await allEvents[i].save();
            }
        }
       
        allEvents.sort(function(a, b) {
            var c = new Date(a.startDate);
            var d = new Date(b.startDate);
       
            return c-d;
        });
        return res.status(200).json({ events: allEvents });
       }
       catch(e){
        console.log(e)
        return res.status(403).json({msg : "Something went wrong"})       }
    },

    singleEvent: async function(req, res) {
        try{
            if ((!req.body.eventID)) {
                return res.status(400).json({ success: false, msg: "Required Event ID" });
            }
            let eventID = req.body.eventID;
            var allEvents = await Events.findOne({_id : eventID}).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" }).populate({path : "appliedStudents"}).populate({path : "rounds.unselectedStudends"}).populate({path : "rounds.selectedStudends"}).populate({path : "appliedStudents"}).populate({path : "rounds.unselectedStudends"}).populate({path : "rounds.absent"});
            return res.status(200).json({ events: allEvents });
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    },
    
    eventsFacultyAssigned: async function(req, res) {
        try{
            if ((!req.body.eventID)) {
                return res.status(400).json({ success: false, msg: "Required Event ID" });
            }
            let eventID = req.body.eventID;
            var allEvents = await Events.findOne({_id : eventID} ).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" }).populate({path : "appliedStudents"});
            return res.status(200).json({ facultyAssigned: allEvents.facultyAssigned });
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    },



    getEventRound: async function(req, res) {
        try{
            
        var eventID = req.body.eventID;

        var getEvent = await Events.findOne({ _id: eventID }).populate({path : "rounds.absent"}).populate({path : "rounds.present"})
        if (!getEvent) {
            return res.status(400).json({ msg: "Events not found" });
        }
        var getRound = getEvent.rounds;


        var time = getRound[getRound.length - 1].time.toString().split(":");
        var date = getRound[getRound.length - 1].date;
        var isPM = time[1].split(" ")
        var finalHour,finalMinute;
        
        
        var todayDate = new Date().toISOString().slice(0, 10).toString().split("-");
        var getHours= new Date().getHours().toLocaleString();
        var getMinutes= new Date().getMinutes().toLocaleString();
        var finalDate = todayDate[2] +" "+ months[Number(todayDate[1]-1)]+", "+ todayDate[0]

        if(isPM[1] === "PM"){
            finalHour = Number(time[0]) + 12
            finalMinute = Number(isPM[0])
        }
        else{
            finalHour = Number(time[0])
            finalMinute = Number(isPM[0]) 
        }

        console.log(getHours)
        console.log(finalHour)

        if(finalDate.toString() === date.toString() && getHours >= finalHour && getRound[getRound.length - 1].status === "open"){
            console.log(getRound[getRound.length - 1].set({showQRCode : "true"}))
            getRound[getRound.length - 1].set({showQRCode : "true"})
            await getEvent.save();
        }
        else{
            await getRound[getRound.length - 1].set({showQRCode : "false"})
            await getEvent.save();


        }

        return res.status(200).json({"events" : getRound});
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    },


    getSingleRound: async function(req, res) {
        try{
            
        var eventID = req.body.eventID;
        var roundID = req.body.roundID;
        var getRound;
        var getEvent = await Events.findOne({ _id: eventID }).populate({path : "rounds.present"});
        for (var i = 0; i < getEvent.rounds.length; i++) {
            if (getEvent.rounds[i]._id == roundID) {
                getRound = getEvent.rounds[i];

            }
        }
        return res.status(200).json(getRound);
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    },

    closeEvent: async function(req, res) {
        try{
            if (!req.body.eventID) {
                res.status(400).json({ msg: "Enter Event ID" });
            }
    
            var closeEvent = await Events.findOneAndUpdate({ _id: req.body.eventID }, { status: "close" });
            if (!closeEvent) {
                return res.status(400).json({ msg: "Events not found" });
            }
            await closeEvent.save();
            res.status(200).json({ msg: "Event Close", event: { id: req.body.eventID, title: closeEvent.title } });
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    },

    getSelectedEvents : async function(req,res){
        try{
            let eventList =[];
            if(!req.body.roundType){
                return res.status(400).json({msg : "Enter round type"})
            }

            let allEvents = await Events.find({status : "close"}).populate({ path: "createdBy" }).populate({ path: "facultyAssigned" });
            for(let i = 0 ; i < allEvents.length ; i++){
                for(let j =0; j < allEvents[i].rounds.length; j++){
                    if(allEvents[i].rounds[j].testType === req.body.roundType){
                     eventList.push(allEvents[i])

                    } 
                }
            }
            return res.status(200).json({list : eventList});
        }
        catch(e)
        {
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})  
        }
    },

    getUnselectedStudents : async function(req,res){
        try{
            let events = req.body.eventList;
            let round = req.body.roundType
            let compareEvents = [];
            var getRound;
            
            for(let k=0 ;k < events.length ;k++){
                var getEvent = await Events.findOne({ _id: events[k] }).populate({path : "rounds.unselectedStudends"})
                for (var i = 0; i < getEvent.rounds.length; i++) {
                    if (getEvent.rounds[i].testType == round) {
                        getRound = getEvent.rounds[i].unselectedStudends;
    
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
    
            return res.status(200).json({list:compareEvents});
        }
        catch(e){
            console.log(e)
            return res.status(403).json({msg : "Something went wrong"})
        }
    }


};

module.exports = functions;