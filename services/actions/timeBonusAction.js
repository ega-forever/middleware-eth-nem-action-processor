const _ = require('lodash'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.timeBonusAction'}),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices');

const events = ['Deposit', 'WithdrawShares', 'FeatureFeeTaken'];
const contracts = ['ERC20Interface', 'ERC20Manager']; /*eslint no-unused-vars: off */

const NEM_DIVISIBILITY = _.get(config.nem, 'divisibillity', 1);
const TIME_DIVISIBILITY = 100000000;

const updateTimeBalance = (address, balance) =>
  accountModel.findOneAndUpdate({address: address}, {$set: {maxTimeBalance: balance}}, {upsert: true});

async function run () {
  const recipient = _.get(this.event, 'payload.who');
  log.info(`TimeBonus run for ${this.address}`);
  // Obtain required settings from network
  const erc = await this.contracts.ERC20Manager.deployed(), // Get the instance of contract
    token = await erc.getTokenAddressBySymbol('TIME'), // Get address of token by symbol
    time = await this.contracts.ERC20Interface.at(token), // get instance of token
    balance = await time.balanceOf(recipient), // obtain balance of time for recipient BigNumber
    user = (await accountModel.findOne({ address: recipient })).toObject(), // load recipient's record from DB
    maxTimeBalance = _.get(user, 'maxTimeBalance', 0), // get maxTimeBalance from record
    bonusRate = _.get(config.nem, 'timeBonus.rate', 0),
    nemAddress = _.get(user, 'nem'); // get NEM address from record

  if(balance.greaterThan(maxTimeBalance) && nemAddress) {
    const transferAmount = Math.round(balance.minus(maxTimeBalance).valueOf() / TIME_DIVISIBILITY) * bonusRate * NEM_DIVISIBILITY;
    log.info('transferAmount: ', transferAmount, balance.minus(maxTimeBalance).valueOf());
    await updateTimeBalance(recipient, balance.toNumber());
    return await nemServices.makeBonusTransfer(nemAddress, transferAmount);
  }
}

module.exports = {run, events};
