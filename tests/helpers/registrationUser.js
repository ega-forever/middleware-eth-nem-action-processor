'use strict';

const accountModel = require('../../models/accountModel'),
    config = require('./config');


module.exports = async (address) => {

    await accountModel.create({
        address: address,
        nem: config.nem_address
    });

};

