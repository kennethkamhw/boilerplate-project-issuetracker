const mongoose = require("mongoose");

// mongoose connection
const db = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.db = db;