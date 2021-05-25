const mongoose = require('mongoose');

const URI = "mongodb+srv://vkdb:vkdb@cluster0.vopge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const connectedDB = async () => {
    console.log("db connecting");
    await mongoose.connect(URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useMongoClient: true
        });
    console.log("db connected");
}

module.exports = connectedDB;