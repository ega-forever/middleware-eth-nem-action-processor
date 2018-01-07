const _ = require('lodash'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.timeBonusAction'}),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices');

const events = ['Deposit', 'WithdrawShares', 'FeatureFeeTaken'];

async function run (event, contracts) {
  const recipient = _.get(event, 'payload.who');
  log.info(`TimeBonus run for ${recipient}`);
  // Obtain required settings from network
  let erc = await contracts.ERC20Manager.deployed(), // Get the instance of contract
    token = await erc.getTokenAddressBySymbol('TIME'), // Get address of token by symbol
    time = await contracts.ERC20Interface.at(token), // get instance of token
    balance = await time.balanceOf(recipient); // obtain balance of time for recipient BigNumber

  let user = await accountModel.findOne({address: recipient}); // load recipient's record from DB

  if (!user)
    return;

  user = user.toObject();

  let maxTimeBalance = _.get(user, 'maxTimeBalance', 0), // get maxTimeBalance from record
    nemAddress = _.get(user, 'nem'); // get NEM address from record

  if (balance.greaterThan(maxTimeBalance) && nemAddress) {
    const transferAmount = Math.round(balance.minus(maxTimeBalance).valueOf() / config.nem.timeBonus.timeDivisibility) * config.nem.timeBonus.rate * config.nem.divisibillity;
    const result = await nemServices.makeBonusTransfer(nemAddress, transferAmount, 'Time Bonus');
    await accountModel.findOneAndUpdate({address: recipient}, {$set: {maxTimeBalance: balance.toNumber()}});
    return result;
  }
}

module.exports = {run, events};
