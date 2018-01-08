require('dotenv/config');

const config = require('../config'),
  expect = require('chai').expect,
  net = require('net'),
  contract = require('truffle-contract'),
  _ = require('lodash'),
  Web3 = require('web3'),
  web3 = new Web3(),
  Promise = require('bluebird'),
  require_all = require('require-all'),
  accountModel = require('../models/accountModel'),
  contracts = require_all({
    dirname: _.nth(require.resolve('chronobank-smart-contracts/build/contracts/MultiEventsHistory').match(/.+(?=MultiEventsHistory)/), 0),
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter)).)*)\.json$/,
    resolve: Contract => contract(Contract)
  }),
  mongoose = require('mongoose');
let accounts = [];

const TEST_RECIPIENT = 'TAX6E3CDBGEPPQNDP6AHWTDKMWPKY7PO2MK5G7QL';
describe('core/sc processor', function () {

  before(async () => {
    let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
    web3.setProvider(provider);
    mongoose.Promise = Promise;
    mongoose.connect(config.mongo.uri, {useMongoClient: true});

    for (let contract_name in contracts) {
      if (contracts.hasOwnProperty(contract_name)) {
        try {
          contracts[contract_name].setProvider(provider);
          contracts[`${contract_name}Instance`] = await contracts[contract_name].deployed();
        } catch (e) {

        }
      }
    }
  });

  after(() => {
    web3.currentProvider.connection.end();
    return mongoose.disconnect();
  });

  it('add account to mongo', async () => {
    accounts = await Promise.promisify(web3.eth.getAccounts)();
    try {
      await new accountModel({address: accounts[0]}).save();
    } catch (e) {
    }
  });  

  it('check accounts balance', async () => {
    const erc = await contracts.ERC20Manager.deployed(),
      token = await erc.getTokenAddressBySymbol('TIME');
      time = await contracts.ERC20Interface.at(token),
      balance = await time.balanceOf(accounts[0]);
  });

  it('test welcome bonus action', async() => {});
  it('test time bonus action', async() => {});
});

