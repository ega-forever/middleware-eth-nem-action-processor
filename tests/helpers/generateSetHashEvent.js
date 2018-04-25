'use strict';

const config = require('../../config'),
  contract = require('truffle-contract'),
  Promise = require('bluebird'),
  userManagerJSON = require('../../node_modules/chronobank-smart-contracts/build/contracts/UserManager.json');

module.exports = async (account, provider) => {
    let UserManager = contract(userManagerJSON);
    UserManager.setProvider(provider);

    let UserManagerInstance = await UserManager.deployed();
    await UserManagerInstance.setOwnHash('hash', {from: account, gas:60000});
}