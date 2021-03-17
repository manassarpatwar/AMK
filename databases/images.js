let mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectID;
let bcrypt = require('bcryptjs');

//The URL which will be queried. Run "mongod.exe" for this to connect

mongoose.Promise = global.Promise;
// todo change that!!!
// let mongoDB = 'mongodb://localhost:27017/characters';
let mongoDB = 'mongodb://localhost:27017/images';

mongoose.Promise = global.Promise;
try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');

// db.dropDatabase();

} catch (e) {
    console.log('error in db connection: ' + e.message);
}

