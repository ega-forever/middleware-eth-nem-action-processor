const nem = require('nem-sdk').default,
  Promise = require('bluebird'),
  config = require('../config');

const makeBonusTransfer = async (address, amount, message) => {
  message = message || 'Transfer from Chronobank';
  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, nem.model.nodes.defaultPort),
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
  transactionEntity.fee = config.nem.txFee;

  return Promise.resolve(nem.model.transactions.send(common, transactionEntity, endpoint)).timeout(2000);
};

module.exports = {makeBonusTransfer};
