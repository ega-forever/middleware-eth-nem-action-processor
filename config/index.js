/**
 * Chronobank/eth-nem-action-processor configuration
 * @module config
 * @returns {Object} Configuration
 */

require('dotenv').config();
const path = require('path');

const config = {
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/data'
  },
  rabbit: {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_eth'
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081,
    auth: process.env.USE_AUTH || false
  },
  web3: {
    network: process.env.NETWORK || 'development',
    uri: `${/^win/.test(process.platform) ? '\\\\.\\pipe\\' : ''}${process.env.WEB3_URI || `/tmp/${(process.env.NETWORK || 'development')}/geth.ipc`}`
  },
  nem: {
    mosaic: process.env.NEM_MOSAIC_NAME || 'cb:minutes',
    divisibillity: 100,
    txFee: process.env.NEM_TX_FEE || 100000,
    host: process.env.NEM_HOST || 'http://localhost',
    privateKey: process.env.NEM_PRIVATE_KEY || 'secret_key',
    actions: process.env.NEM_ACTIONS ? _.chain(process.env.NEM_ACTIONS)
      .split(',').defaults([]).value() : ['welcomeBonus', 'timeBonus'],
    welcomeBonus: {
      amount: 1
    },
    timeBonus: {
      rate: process.env.NEM_BONUS_RATE || 60,
    }
  },
  smartContracts: {
    path: process.env.SMART_CONTRACTS_PATH || path.join(__dirname, '../node_modules/chronobank-smart-contracts/build/contracts')
  }
};

module.exports = config;
