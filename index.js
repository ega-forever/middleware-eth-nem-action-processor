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
  bunyan = require('bunyan'),
  Promise = require('bluebird'),
  log = bunyan.createLogger({name: 'core.nemActionProcessor'}),
  amqp = require('amqplib');

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

  await channel.assertExchange('events', 'topic', {durable: false});
  await channel.assertQueue(defaultQueue, {arguments: {messageTtl: config.rabbit.ttl}});
  await channel.bindQueue(defaultQueue, 'events', `${config.rabbit.serviceName}_chrono_sc.*`);

  channel.prefetch(10);
  channel.consume(defaultQueue, async (data) => {
    try {
      let event = JSON.parse(data.content.toString());
      await runActions(event);
      channel.ack(data);
    } catch (e) {

      if (e && e.code === 0) {
        log.info('the requested account hasn\'t been found');
        return setTimeout(() => channel.nack(data), 5000);
      }

      log.error(e);
      log.info('an error occurred, exiting in 5 seconds...');
      setTimeout(() => process.exit(0), 5000);
    }
  });
};

module.exports = init();
