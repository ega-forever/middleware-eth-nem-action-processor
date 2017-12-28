const _ = require('lodash'),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices'),
  Promise = require('bluebird');

const events = ['SetHash'];
const contracts = ['UserManager'];
const NEM_DIVISIBILITY = _.get(config.nem, 'divisibillity', 1);

async function run() {
  console.log('Running welcomeBonus');
  
  const recipient = _.get(this.event, 'payload.key'),
    user = (await accountModel.findOne({ address: recipient })).toObject(), // load recipient's record from DB
    nemAddress = _.get(user, 'nem'), // get NEM address from record
    isWBSent = _.get(user, 'welcomeBonusSent', false),
    amount = _.get(config.nem, 'welcomeBonus.amount', 1);
  
  if(nemAddress && !isWBSent) {
    await accountModel.findOneAndUpdate({address: recipient}, {$set: {welcomeBonusSent: true}}, {upsert: true});
    return await nemServices.makeBonusTransfer(nemAddress, amount * NEM_DIVISIBILITY);    
  }
}

module.exports = {run, events};