/**
 * Middleware service for handling transfers to NEM crypto cyrrency
 * Update balances & make transfers from ETH wallet to NEM
 * in received transactions from blockParser via amqp
 *
 * @module Chronobank/eth-nem-action-processor
 * @requires config
 * @requires models/accountModel
 */

const config = require('./config'),
  runActions = require('./services/runActions'),
  Web3 = require('web3'),
  net = require('net'),
  bunyan = require('bunyan'),
  Promise = require('bluebird'),
  log = bunyan.createLogger({name: 'core.nemActionProcessor'}),
  amqp = require('amqplib'),
  contract = require('truffle-contract'),
  requireAll = require('require-all'),
  _ = require('lodash'),
  contracts = requireAll({ //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
    dirname: config.smartContracts.path,
    filter: /(^((ChronoBankPlatformEmitter)|(?!Emitter).)*)\.json$/,
    resolve: Contract => contract(Contract)
  });

const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect(config.mongo.accounts.uri, {useMongoClient: true});

const defaultQueue = `${config.rabbit.serviceName}.chrono_nem_processor`;

let init = async () => {
  let conn = await amqp.connect(config.rabbit.url)
    .catch(() => {
      log.error('rabbitmq is not available!');
      process.exit(0);
    });

  let channel = await conn.createChannel();

  channel.on('close', () => {
    log.error('rabbitmq process has finished!');
    process.exit(0);
  });

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

  web3.currentProvider.connection.on('end', () => {
    log.error('ipc process has finished!');
    process.exit(0);
  });

  web3.currentProvider.connection.on('error', () => {
    log.error('ipc process has finished!');
    process.exit(0);
  });

  _.forEach(contracts, c => c.setProvider(web3.currentProvider));

  await channel.assertExchange('events', 'topic', {durable: false});
  await channel.assertQueue(defaultQueue);
  await channel.bindQueue(defaultQueue, 'events', `${config.rabbit.serviceName}_chrono_sc.*`);

  channel.prefetch(2);
  channel.consume(defaultQueue, async (data) => {
    try {
      let event = JSON.parse(data.content.toString());
      await runActions(event, contracts);
      channel.ack(data);
    } catch (e) {
      log.error(e);
      log.info('an error occurred, exiting in 5 seconds...');
      setTimeout(() => process.exit(0), 5000);
    }
  });
};

module.exports = init();
