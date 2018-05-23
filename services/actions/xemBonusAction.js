/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.xemBonusAction'}),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices');

module.exports = async (nemAddress, maxXemAmount) => {
  log.info(`XemBonus run for ${nemAddress}`);

  const balance = await nemServices.getNemBalance(nemAddress);
  const transferAmount = (balance - maxXemAmount) / (config.nem.xemBonus.xemDivisibility * config.nem.xemBonus.rate) * config.nem.divisibillity;
  if (transferAmount >= 1) {
    const result = await nemServices.makeBonusTransfer(nemAddress, transferAmount, 'Xem Bonus');
    await accountModel.updateMany({nem: nemAddress}, {$set: {maxXemAmount: balance}, $inc: {transferLimit: 1}});
    return result;
  }
  return 1;
};
