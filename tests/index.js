require('dotenv/config');

const config = require('../config'),
  expect = require('chai').expect,
  net = require('net'),
  contract = require('truffle-contract'),
  _ = require('lodash'),
  Web3 = require('web3'),
  web3 = new Web3(),
  Promise = require('bluebird'),
  accountModel = require('../models/accountModel'),
  mongoose = require('mongoose');

describe('core/sc processor', function () {

  before(async () => {

  });

  after(() => {});

  it('check NEM balance', async () => {
  });

});

