'use strict';

const accountModel = require('../../models/accountModel'),
    config = require('./config');

module.exports = async (address) => {
    return await accountModel.find({
        address: address
    });
}