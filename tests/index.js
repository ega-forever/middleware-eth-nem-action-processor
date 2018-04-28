'use strict';

require('dotenv/config');

const config = require('../config'),
  valueConfig = require('./helpers/config'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  Web3 = require('web3'),
  net = require('net'),
  expect = require('expect.js'),
  timeBonus = require('../services/actions/timeBonusAction'),
  welcomeBonus = require('../services/actions/welcomeBonusAction'),
  xemBonus = require('../services/actions/xemBonusAction'),
  aggregateModule = require('./helpers/aggregateModule'),
  checkModel = require('./helpers/checkAccountModel'),
  userRegistration = require('./helpers/registrationUser'),
  generateEvents = require('./helpers/generateEvents'),
  deleteModels = require('./helpers/deleteModels'),
  checkBalanceUser = require('./helpers/checkBalanceUser');

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);
mongoose.connect(config.mongo.data.uri, {useMongoClient: true});
let accounts;

describe('core/nem processor', function () {

    before(async () => {
        const web3 = new Web3();
        const provider = new Web3.providers.IpcProvider(config.web3.uri, net);
        web3.setProvider(provider);
        accounts = await Promise.promisify(web3.eth.getAccounts)();
        await generateEvents(accounts[0], provider);
        await userRegistration(accounts[0]);
    });

    after(async () => {
      await deleteModels();
      await mongoose.connection.close();
    });

    it('test aggregate data base', async () => {
        await Promise.delay(60000);
        let result = await aggregateModule();
        expect(result.depositSets).to.not.be.empty();
        expect(result.welcomeBonusSets).to.not.be.empty();
        expect(result.accounts).to.not.be.empty();
    });

    it('test welcome bonus action', async () => {
      await Promise.delay(1000);
      let oldBalance = await checkBalanceUser.mosaicBalance(valueConfig.nem_address);
      let result =  await welcomeBonus(accounts[0], valueConfig.amount, valueConfig.nem_address);

      await Promise.delay(60000);
      let newBalance = await checkBalanceUser.mosaicBalance(valueConfig.nem_address);

      expect(result.code).to.be.equal(1);
      expect(newBalance - oldBalance).to.be.equal(100);
    });

    it('test time bonus action', async () => {
      await Promise.delay(1000);
      let oldBalance = await checkBalanceUser.mosaicBalance(valueConfig.nem_address);
      let result = await timeBonus(accounts[0], valueConfig.currentAmount, valueConfig.depositMaxAmount, valueConfig.nem_address);

      await Promise.delay(60000);
      let newBalance = await checkBalanceUser.mosaicBalance(valueConfig.nem_address);

      expect(result.code).to.be.equal(1);
      expect(newBalance - oldBalance).to.be.equal(120);
    });

    it('test xem bonus action', async () => {
      await Promise.delay(1000);
      let xemBalance = await checkBalanceUser.nemBalance(valueConfig.nem_address);
      let oldBalance = await checkBalanceUser.mosaicBalance(valueConfig.nem_address);
      let result = await xemBonus(valueConfig.nem_address, valueConfig.maxXemAmount, accounts[0]);

      await Promise.delay(60000);
      let newBalance = await checkBalanceUser.mosaicBalance(valueConfig.nem_address);

      expect(result.code).to.be.equal(1);
      expect(newBalance - oldBalance).to.be.equal(xemBalance);
    });
});
