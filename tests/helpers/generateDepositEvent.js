'use strict';

const config = require('../../config'),
  contract = require('truffle-contract'),
  Promise = require('bluebird'),
  erc20ManagerJSON = require('../../node_modules/chronobank-smart-contracts/build/contracts/ERC20Manager.json'),
  timeHolderJSON = require('../../node_modules/chronobank-smart-contracts/build/contracts/TimeHolder.json'),
  erc20InterfaceJSON = require('../../node_modules/chronobank-smart-contracts/build/contracts/ERC20Interface.json'),
  timeHolderWalletJSON = require('../../node_modules/chronobank-smart-contracts/build/contracts/TimeHolderWallet.json');

module.exports = async (account, provider) => {

  let ERC20Manager = contract(erc20ManagerJSON);
  let TimeHolderManager = contract(timeHolderJSON);
  let ERC20InterfaceManager = contract(erc20InterfaceJSON);
  let TimeHolderWalletManager = contract(timeHolderWalletJSON);

  ERC20Manager.setProvider(provider);
  TimeHolderManager.setProvider(provider);
  ERC20InterfaceManager.setProvider(provider);
  TimeHolderWalletManager.setProvider(provider);

  let ERC20ManagerInstance = await ERC20Manager.deployed();
  let addressTime = await ERC20ManagerInstance.getTokenAddressBySymbol('TIME');

  let TimeHolderWalletInstance = await TimeHolderWalletManager.deployed();
  let addressTimeHolder = await TimeHolderWalletInstance.address;

  let ERC20InterfaceInstance = await ERC20InterfaceManager.at(addressTime);
  await ERC20InterfaceInstance.approve(addressTimeHolder, 10, {from: account});

  let TimeHolderInstance = await TimeHolderManager.deployed();
  await TimeHolderInstance.deposit(addressTime, 10, {from: account, gas: 600000});
}
