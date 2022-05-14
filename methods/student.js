const Users = require("../models/student");
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
var bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');


var functions = {
    addNew: function(req, res) {
        let userImage;
        type = req.body.type;
        if (type == "Student") {
            checkEmail = req.body.email.split(".");
            if ((checkEmail[0].length != 10)) {
                res.status(400).send("Invalid email id");
                return;
            }
        }

        if ((!req.body.name) || (!req.body.password) || (!req.body.email || (!req.body.systemID) || (!req.body.type) || (!req.body.year) || (!req.body.semester) || (!req.body.course) || (!req.body.gender))) {
            res.json({ success: false, msg: "Enter all fields" });
            return;

        } else if (!(req.body.email).includes("@") || !(req.body.email).includes("sharda")) {
            res.status(400).send("Invalid email id");
            return;

        } else if ((req.body.password).length < 6) {
            res.status(400).send("Password length must be greater than 6");
            return;
        } else if ((req.body.systemID).length != 10) {
            res.status(400).send("Invalid System ID");
            return;

        } else if ((req.body.type != "Student") && (req.body.type != "Faculty")) {
            console.log(req.body.type);
            res.status(400).send("Invalid Details");
            return;
        } else {

            if (!(req.body.profileImage)) {
                userImage = "";

            }

            Users.findOne({ email: req.body.email }).then((err) => {
                if (err) {
                    res.status(400).send("email already exits");
                    return;
                } else {
                    console.log("dsa");

                    var password = bcrypt.hashSync(req.body.password, 10);
                    var newUser = Users({
                        email: req.body.email,
                        name: req.body.name,
                        password: password,
                        systemID: req.body.systemID,
                        type: req.body.type,
                        course: req.body.course,
                        year: req.body.year,
                        semester: req.body.semester,
                        gender: req.body.gender,
                        profileImage: userImage
                    });


                    newUser.save(function(err, newUser) {
                        if (err) {
                            return res.status(400).json({ success: false, msg: "Failed to save" });
                        } else {

                            var token = jwt.encode(req.body.email, config.secret);
                            return res.json({ success: "User Registered", token: token, user: newUser });

                        }

                    });
                }
            });

        }
    },

    authorization: function(req, res) {
        Users.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                throw err;
            }
            if (!user) {
                res.status(403).send({ success: false, msg: "user not found" });
            } else {


                user.comparePassword(req.body.password, function(err, isMatch) {
                    if (isMatch && !err) {
                        var token = jwt.encode(user.email, config.secret);
                        res.json({ success: true, token: token });
                        return;
                    } else {
                        return res.status(403).json({ success: false, msg: "Password wrong" });
                    }
                });
            }
        });
    },
    sendOTP: async function(req, res) {
        Users.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                throw err;
            }
            if (!user) {
                return res.status(403).send({ success: false, msg: "user not found" });
            } else {

                var userEmail = req.body.email;
                let mailTransporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'brishabh139@gmail.com',
                        pass: "kavhovonkeswhrph"
                    }
                });
                var finalOTP = Math.floor(100000 + Math.random() * 900000);

                let mailDetails = {
                    from: 'brishabh139@gmail.com',
                    to: userEmail,
                    subject: 'Test mail',
                    text: 'OTP for password reset is ' + finalOTP
                };
                mailTransporter.sendMail(mailDetails, async function(err, data) {
                    if (err) {
                        res.status(400).json({ msg: 'Error Occurs' });
                    } else {
                        var user = await Users.findOne({ email: userEmail });
                        user.otp = finalOTP;
                        await user.save();
                        res.status(200).json({ msg: "OTP Send" });

                    }
                });


            }
        });
    },

    verifyOTP: async function(req, res) {
        Users.findOne({ email: req.body.email }, async function(err, user) {
            if (err) {
                throw err;
            }
            if (!user) {
                return res.status(403).send({ success: false, msg: "user not found" });
            } else {
                if ((!req.body.otp)) {
                    res.status(400).json({ msg: "Invalid OTP" });
                    return;
                }
                if ((!req.body.email)) {
                    res.status(400).json({ msg: "Email Required" });
                    return;
                } else {


                    var otpVerify = req.body.otp;

                    var getUser = await Users.findOne({ email: req.body.email });
                    //    console.log(getUser.otp);
                    if (getUser.otp == otpVerify) {
                        await Users.updateOne({ email: req.body.email }, { $unset: { otp: otpVerify } });
                        return res.status(200).json({ msg: "OTP Verified" });

                    } else {
                        return res.status(400).json({ msg: "Invalid OTP" });

                    }



                }
            }
        });
    },

    forgetPassword: async function(req, res) {
        Users.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                throw err;
            }
            if (!user) {
                return res.status(403).send({ success: false, msg: "user not found" });
            } else {


                const passwordHash = bcrypt.hashSync(req.body.password, 10);
                Users.findOneAndUpdate({ email: req.body.email }, { password: passwordHash }, (err, data) => {
                    if (err) {
                        throw err;
                    }
                    return res.status(200).send({ msg: "Password Reset", "user": { email: req.body.email, password: passwordHash } });
                });
            }
        });
    },
    getUserInfo: async function(req, res) {
        if (req.headers["x-access-token"]) {
            var token = req.headers["x-access-token"];
            var decodeToken = jwt.decode(token, config.secret);
            var getUserData = await Users.findOne({ email: decodeToken });
            return res.json({ success: "User Info", user: getUserData });
        } else {
            return res.json({ success: false, msg: 'No Found' });

        }
    },

    getAllUser: async function(req, res) {
        var getAllUserData = await Users.find({}).populate({ path: "events" });
        return res.json({ "user": getAllUserData });
    },

    singleUser: async function(req, res) {

        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Users.findOne({ email: decodeToken }).populate({ path: "events" });
        return res.json({ "user": getUserData });
    },

    uploadImage: async function(req, res) {

        var userImage;
        if (!req.headers["x-access-token"]) {
            return res.status(400).json({ msg: "Please provide token" });
        }
        if (!req.body.profileImage) {

            return res.status(400).json({ msg: "Please upload a profile image" });
        } else {
            userImage = req.body.profileImage;
        }

        var token = req.headers["x-access-token"];
        var decodeToken = jwt.decode(token, config.secret);
        var getUserData = await Users.findOneAndUpdate({ email: decodeToken }, { profileImage: userImage });
        await getUserData.save();
        return res.status(200).json({ msg: "Image Uploaded" });

    }

};
module.exports = functions;