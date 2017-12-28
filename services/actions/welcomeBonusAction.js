const _ = require('lodash'),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.welcomeBonusAction'});

const events = ['SetHash'];
const contracts = ['UserManager']; /*eslint no-unused-vars: off */
const NEM_DIVISIBILITY = _.get(config.nem, 'divisibillity', 1);

async function run () {
  const recipient = _.get(this.event, 'payload.key');
  log.info(`Running welcomeBonus ${recipient}`);
  
  const user = (await accountModel.findOne({ address: recipient })).toObject(), // load recipient's record from DB
    nemAddress = _.get(user, 'nem'), // get NEM address from record
    isWBSent = _.get(user, 'welcomeBonusSent', false),
    amount = _.get(config.nem, 'welcomeBonus.amount', 1);
  
  if(nemAddress && !isWBSent) {
    await accountModel.findOneAndUpdate({address: recipient}, {$set: {welcomeBonusSent: true}}, {upsert: true});
    return await nemServices.makeBonusTransfer(nemAddress, amount * NEM_DIVISIBILITY);    
  }
}

module.exports = {run, events};
