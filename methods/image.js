const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
    destination : function(req,res,cb){
        cb(null,"upload/");

        },
        filename : function(req,file,cb){
            let ext = path.extname(file.originalname);
            cb(null,Date.now() + ext);
        }
});

var upload = multer({
    storage:storage,
    fileFilter :function(req,file,callBack){
        if(file.mimetype == "image/png" || file.mimetype == "imgage/jpg" ){
            callBack(null,true);
        }
        else{
            console.log("Invalid File");
            callBack(null,false);
        }
    },
    limits:{
        fileSize : 1024 * 1024 *2
    }
});

module.exports = upload;