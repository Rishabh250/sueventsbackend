const mongoose = require("mongoose");
const dbConfig = require("./dbConfig");
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(dbConfig.database, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected : ${conn.connection.host}`);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
};

module.exports = connectDB;