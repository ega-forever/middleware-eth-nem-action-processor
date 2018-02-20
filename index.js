/**
 * Middleware service for handling transfers to NEM crypto currency
 * Update balances & make transfers from ETH wallet to NEM
 * in received transactions from blockParser via amqp
 *
 * @module Chronobank/eth-nem-action-processor
 * @requires config
 * @requires models/accountModel
 */

const config = require('./config'),
  mongoose = require('mongoose'),
  Promise = require('bluebird');

mongoose.Promise = Promise; // Use custom Promises
mongoose.connect(config.mongo.data.uri, {useMongoClient: true});
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);

const bunyan = require('bunyan'),
  scheduleService = require('./services/scheduleService'),
  log = bunyan.createLogger({name: 'core.nemActionProcessor'});

[mongoose.accounts, mongoose.connection].forEach(connection =>
  connection.on('disconnected', function () {
    log.error('mongo disconnected!');
    process.exit(0);
  })
);

let init = async () => {

  scheduleService();

};

module.exports = init();
