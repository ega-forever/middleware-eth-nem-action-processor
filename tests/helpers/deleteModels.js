'use strict';

const accountModel = require('../../models/accountModel'),
     depositModel = require('./models/depositModel'),
     setHash = require('./models/setHashModel');

module.exports = async () => {
    await accountModel.remove().exec();
    await depositModel.remove().exec();
    await setHash.remove().exec();
}
