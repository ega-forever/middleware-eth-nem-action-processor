/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const _ = require('lodash'),
  config = require('../../config'),
  contract = require('truffle-contract'),
  Promise = require('bluebird'),
  requireAll = require('require-all'),
  net = require('net'),
  fs = require('fs');

module.exports = async (account, provider) => {
  let contracts = {};

  if (fs.existsSync(config.smartContracts.path)) {
    contracts = requireAll({
      dirname: config.smartContracts.path,
      filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter)).)*)\.json$/,
      resolve: Contract => contract(Contract)
    });
  };

  contracts.UserManager.setProvider(provider);
  contracts.ERC20Manager.setProvider(provider);
  contracts.TimeHolder.setProvider(provider);
  contracts.ERC20Interface.setProvider(provider);
  contracts.TimeHolderWallet.setProvider(provider);

  let UserManagerInstance = await contracts.UserManager.deployed();
  let ERC20ManagerInstance = await contracts.ERC20Manager.deployed();
  let TimeHolderWalletInstance = await contracts.TimeHolderWallet.deployed();
  let TimeHolderInstance = await contracts.TimeHolder.deployed();

  let addressTime = await ERC20ManagerInstance.getTokenAddressBySymbol('TIME');
  let addressTimeHolder = await TimeHolderWalletInstance.address;
  let ERC20InterfaceInstance = await contracts.ERC20Interface.at(addressTime);

  await UserManagerInstance.setOwnHash('hash', {from: account, gas:config.web3.gas});
  await ERC20InterfaceInstance.approve(addressTimeHolder, 10, {from: account});
  await TimeHolderInstance.deposit(addressTime, 10, {from: account, gas: config.web3.gas});
};
