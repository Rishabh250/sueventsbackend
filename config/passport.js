var JwtStrategy = require('passport-jwt').Strategy;
 var ExtractJwt = require('passport-jwt').ExtractJwt;

 var User = require('../models/user'); 
 var config = require('./dbConfig');
 
 module.exports = function(passport){
    var otps = {};

    otps.secretOrKey = config.secret;
    otps.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');

    passport.use(new JwtStrategy(otps,function(jwt_playLoad,done){
        User.find({
            id:jwt_playLoad.id
        },
        function(err,user){
            if(err){
                return done(err);
            }
            if(user){
                return done(null,user); 
            }
            else{
                return done(null,false);
            }
        });
    }));
 };