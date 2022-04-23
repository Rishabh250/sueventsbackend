const { Router } = require("express");
const express = require("express");
const { route } = require("express/lib/application");
const actions = require('../methods/action');
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

module.exports = router;