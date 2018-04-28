'use strict';

require('dotenv').config();

const config = {
    nem_address: process.env.NEM_ADDRESS,
    maxXemAmount: 0,
    currentAmount: process.env.CURRENT_AMOUNT || 0,
    depositMaxAmount: process.env.DEPOSIT_MAX_AMOUNT || 2000000,
    amount: process.env.AMMOUNT_TEST || 1
};

module.exports = config;
