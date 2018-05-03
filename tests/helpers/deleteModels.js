/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const accountModel = require('../../models/accountModel'),
     depositModel = require('./models/depositModel'),
     setHash = require('./models/setHashModel');

module.exports = async () => {
    await accountModel.remove().exec();
    await depositModel.remove().exec();
    await setHash.remove().exec();
}
