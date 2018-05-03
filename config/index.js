/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Chronobank/eth-nem-action-processor configuration
 * @module config
 * @returns {Object} Configuration
 */

require('dotenv').config();
const _ = require('lodash');
const path = require('path');

const config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth'
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth'
    }
  },
  schedule: {
    job: process.env.SCHEDULE_NEM_JOB || '30 * * * * *'
  },
  web3: {
    network: process.env.NETWORK || 'development',
    uri: `${/^win/.test(process.platform) ? '\\\\.\\pipe\\' : ''}${process.env.WEB3_URI || `/tmp/${(process.env.NETWORK || 'development')}/geth.ipc`}`,
    gas: process.env.GAS || 600000
  },
  smartContracts: {
    path: process.env.SMART_CONTRACTS_PATH || path.join(__dirname, '../node_modules/chronobank-smart-contracts/build/contracts')
  },
  nem: {
    network: process.env.NEM_NETWORK ? parseInt(process.env.NEM_NETWORK) : -104,
    mosaic: process.env.NEM_MOSAIC_NAME || 'cb:minutes',
    divisibillity: 100,
    txFee: process.env.NEM_TX_FEE,
    host: process.env.NEM_HOST || 'http://localhost',
    port: process.env.NEM_PORT || 7890,
    privateKey: process.env.NEM_PRIVATE_KEY || 'secret_key',
    password: process.env.NEM_PASSWORD || '',
    actions: process.env.NEM_ACTIONS ? _.chain(process.env.NEM_ACTIONS)
      .split(',').defaults([]).value() : ['welcomeBonus', 'timeBonus', 'xemBonus'],
    welcomeBonus: {
      amount: 1
    },
    timeBonus: {
      rate: process.env.NEM_BONUS_RATE || 60,
      timeDivisibility: 100000000 //1 time
    },
    xemBonus: {
      xemDivisibility: 1000,
      rate: process.env.TIME_BONUS_RATE || 200
    },
    transferLimit: process.env.TRANSFER_LIMIT || 10
  },
  bonusSwitch: {
    welcomeBonus: process.env.WELCOME_BONUS || true,
    timeBonus: process.env.TIME_BONUS || true,
    xemBonus: process.env.XEM_BONUS || true
  }
};

module.exports = config;
