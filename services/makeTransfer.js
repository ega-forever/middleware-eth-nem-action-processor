const accountModel = require('../models/accountModel'),
  nemServices = require('./nemServices'),
  _ = require('lodash'),
  net = require('net'),
  Web3 = require('web3'),
  path = require('path'),
  config = require('../config'),
  contract = require('truffle-contract');

const provider = new Web3.providers.IpcProvider(config.web3.uri, net),
  contractsPath = path.join(__dirname, '../node_modules', 'chronobank-smart-contracts/build/contracts');

// Contracts loader
const loadContracts = (contractPath, provider, contracts) => 
  _.chain(contracts)
    .transform((acc, name) => {
      const contr = require(path.join(contractsPath, `${name}.json`));
      acc[name] = contract(contr);
      acc[name].setProvider(provider);
    }, {})
    .value();

// Load & init required contracts by truffle
const contracts = loadContracts(contractsPath, provider, ['ERC20Interface', 'ERC20Manager']),
  updateTimeBalance = (address, balance) =>
    accountModel.findOneAndUpdate({ address: address }, {$set: { maxTimeBalance:balance }}, { upsert: true }),
  checkNEMBalance = () => {};
    
module.exports.checkCredit = async recipient => {
  // Obtain required settings from network
  const erc = await contracts.ERC20Manager.deployed(), // Get the instance of contract
    token = await erc.getTokenAddressBySymbol('TIME'), // Get address of token by symbol
    time = await contracts.ERC20Interface.at(token), // get instance of 
    balance = await time.balanceOf(recipient), // obtain balance of time for recipient BigNumber
    user = (await accountModel.findOne({ address: recipient })).toObject(), // load recipient's record from DB
    maxTimeBalance = _.get(user, 'maxTimeBalance', 0), // get maxTimeBalance from record
    nemAddress = _.get(user, 'connected.nem'); // get NEM address from record

  // console.log(maxTimeBalance, balance.greaterThan(maxTimeBalance), balance.minus(maxTimeBalance).valueOf(), balance);
  if(balance.greaterThan(maxTimeBalance) && nemAddress) {
    checkNEMBalance();
    const transferAmount = Math.round(balance.minus(maxTimeBalance).valueOf() / 100000000) * config.nem.bonusRate;
    // console.log('transferAmount: ', balance.minus(maxTimeBalance).valueOf());
    await nemServices.makeBonusTransfer(nemAddress, transferAmount);
    // console.log(transferResult);
    await updateTimeBalance(recipient, balance);
  }
};
