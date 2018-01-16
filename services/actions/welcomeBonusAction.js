const _ = require('lodash'),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.welcomeBonusAction'});

const events = ['SetHash'];

async function run (event) {
  const recipient = _.get(event, 'payload.key');
  log.info(`Running welcomeBonus ${recipient}`);

  let user = await accountModel.findOne({address: recipient}); // load recipient's record from DB

  if (!user)
    return Promise.reject({code: 0});

  user = user.toObject();

  const nemAddress = _.get(user, 'nem'), // get NEM address from record
    isWBSent = _.get(user, 'welcomeBonusSent', false);

  if (nemAddress && !isWBSent) {
    let result = await nemServices.makeBonusTransfer(nemAddress, config.nem.welcomeBonus.amount * config.nem.divisibillity, 'Welcome Bonus');
    await accountModel.findOneAndUpdate({address: recipient}, {$set: {welcomeBonusSent: true}});
    return result;
  }
}

module.exports = {run, events};
