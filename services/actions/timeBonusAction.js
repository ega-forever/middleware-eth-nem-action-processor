const _ = require('lodash'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.timeBonusAction'}),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices');

const events = ['Deposit'];

async function run (event) {
  const recipient = _.get(event, 'payload.who');
  const amount = _.get(event, 'payload.amount', 0);
  log.info(`TimeBonus run for ${recipient}`);
  // Obtain required settings from network

  let user = await accountModel.findOne({address: recipient}); // load recipient's record from DB

  if (!user)
    return Promise.reject({code: 0});

  user = user.toObject();

  let maxTimeDeposit = _.get(user, 'maxTimeDeposit', 0), // get maxTimeDeposit from record
    nemAddress = _.get(user, 'nem'); // get NEM address from record

  if (nemAddress && (amount - maxTimeDeposit) / config.nem.timeBonus.timeDivisibility * config.nem.timeBonus.rate >= 1) {
    const transferAmount = (amount - maxTimeDeposit) / config.nem.timeBonus.timeDivisibility * config.nem.timeBonus.rate * config.nem.divisibillity;
    const result = await nemServices.makeBonusTransfer(nemAddress, transferAmount, 'Time Bonus');
    await accountModel.findOneAndUpdate({address: recipient}, {$set: {maxTimeDeposit: amount}});
    return result;
  }
}

module.exports = {run, events};
