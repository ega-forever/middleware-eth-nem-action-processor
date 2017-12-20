/** 
 * Mongoose model. Accounts
 * @module models/accountModel
 * @returns {Object} Mongoose model
 * @requires factory/accountMessageFactory
 */

const mongoose = require('mongoose'),
  messages = require('../factories').messages.accountMessageFactory;

require('mongoose-long')(mongoose);

const Account = new mongoose.Schema({
  address: {
    type: String,
    unique: true,
    required: true,
    validate: [a=>  /^(0x)?[0-9a-fA-F]{40}$/.test(a), messages.wrongAddress]
  },
  balance: {type: mongoose.Schema.Types.Long, default: 0},
  created: {type: Date, required: true, default: Date.now},
  erc20token : {type: mongoose.Schema.Types.Mixed, default: {}},
  nem: {
    type: String,
    unique: true,
    required: true,
    validate: [a=>  /^[0-9A-Z]{40}$/.test(a), messages.wrongAddress]
  },
  maxTimeBalance: {type: mongoose.Schema.Types.Long, default: 0},
  welcomeBonusSent: {type: Boolean, default: false}
});

module.exports = mongoose.model('EthAccount', Account);