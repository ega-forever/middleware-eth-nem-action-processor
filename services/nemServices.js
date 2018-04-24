/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const nem = require('nem-sdk').default,
  Promise = require('bluebird'),
  _ = require('lodash'),
  config = require('../config');

const makeBonusTransfer = async (address, amount, message) => {
  message = message || 'Transfer from Chronobank';
  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port),
    common = nem.model.objects.create('common')(config.nem.password, config.nem.privateKey),
    mosaicObj = {
      namespace: config.nem.mosaic.split(':')[0],
      mosaic: config.nem.mosaic.split(':')[1]
    };

  // Create mosaic object
  const mosaicAttachment = nem.model.objects.create('mosaicAttachment')(mosaicObj.namespace, mosaicObj.mosaic, amount);

  // Create transfer object
  let transferTransaction = nem.model.objects.create('transferTransaction')(address, 1, message);

  transferTransaction.mosaics.push(mosaicAttachment);
  const fullMosaicName = nem.utils.format.mosaicIdToName(mosaicAttachment.mosaicId);

  // Pull definition for our Mosaic
  const mosaicDefinition = await nem.com.requests.namespace.mosaicDefinitions(endpoint, mosaicAttachment.mosaicId.namespaceId);
  const neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(mosaicDefinition.data, [mosaicAttachment.mosaicId.name]);

  // Create definition meta data pair
  let mosaicDefinitionMetaDataPair = nem.model.objects.get('mosaicDefinitionMetaDataPair');
  mosaicDefinitionMetaDataPair[fullMosaicName] = {};
  mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];

  // Prepare transaction object
  let transactionEntity = nem.model.transactions
    .prepare('mosaicTransferTransaction')(common, transferTransaction, mosaicDefinitionMetaDataPair, config.nem.network);

  // Set the fee for transaction (increasing value makes transaction execution faster)
  if (config.nem.txFee)
    transactionEntity.fee = config.nem.txFee;

  let result = await Promise.resolve(nem.model.transactions.send(common, transactionEntity, endpoint)).timeout(2000);
  if (!_.has(result, 'code') || ![0, 1].includes(result.code))
    return Promise.reject(result);

  return result;
};

const getNemBalance = async (address) => {
  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port);
  const nemAccount = await nem.com.requests.account.data(endpoint, address);
  return nemAccount.account.balance;
};

module.exports = {
  makeBonusTransfer,
  getNemBalance
};
