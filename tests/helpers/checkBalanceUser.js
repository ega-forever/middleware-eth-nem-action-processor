'use strict';

require('dotenv/config');

const nem = require('nem-sdk').default,
  config = require('../../config'),
  _ = require('lodash');

 const mosaicBalance = async (address) => {

   const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port);
   const nemAccount = await nem.com.requests.account.mosaics.owned(endpoint, address);
   const mosaic = config.nem.mosaic.split(':')[1];

   let balance = _.chain(nemAccount.data)
      .filter(data => data.mosaicId.name === mosaic)
      .map(data => data.quantity)
      .value();

   return balance;
};

const nemBalance = async (address) => {
  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port);
  const nemAccount = await nem.com.requests.account.data(endpoint, address);
  const balance = nemAccount.account.balance / (config.nem.xemBonus.xemDivisibility * config.nem.xemBonus.rate);
  return Number(balance.toFixed(0));
};

module.exports = {
  mosaicBalance,
  nemBalance
}
