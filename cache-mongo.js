var os = require('os');
var mongoose = require('mongoose');
var MongoMemoryServer = require('mongodb-memory-server');

const fs = require('fs');

const fileHandler = require('./routes/helpers/FileHandler')

/**
 * In memory database
 */

mongoose.Promise = Promise;

const mongod = new MongoMemoryServer.MongoMemoryServer();

const mongooseOpts = { // options for mongoose 4.11.3 and above
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
};

mongod.getConnectionString().then((mongoUri) => {
    mongoose.connect(mongoUri, mongooseOpts);
    mongoose.connection.on('error', () => {
        throw new Error(`Mongoose: unable to connect to database: ${mongoUri}`);
    });
    mongoose.connection.on('connected', () => {
        console.info('Mongoose: connection created')

    });
    mongoose.connection.on('disconnected', () => {
        console.info('Mongoose: connection disconnected')
    });

});


/**
 *
 * @returns {Promise<{port: number, dbName: string, dbPath: string, uri: string}>}
 */
/*
exports.url = async function () {
    const uri = await mongod.getConnectionString();
    const port = await mongod.getPort();
    const dbPath = await mongod.getDbPath();
    const dbName = await mongod.getDbName();

    return {uri,port,dbPath,dbName};
}
*/

exports.stop = function() {
    // you may stop mongod manually
    mongod.stop();
    return 'Mongoose: mongod cache stoped';
}


