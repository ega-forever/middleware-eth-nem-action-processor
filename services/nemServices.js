const nem = require('nem-sdk').default,
  config = require('../config');

const makeBonusTransfer = async (address, amount) => {
  const message = '!!!! Demo Bonus from Chronobank',
    endpoint = nem.model.objects.create('endpoint')(config.nem.host, nem.model.nodes.defaultPort),
    common = nem.model.objects.create('common')('', config.nem.privateKey),
    mosaicObj = {
      namespace: config.nem.mosaic.split(':')[0],
      mosaic: config.nem.mosaic.split(':')[1]
    };

  // Create mosaic object
  const mosaicAttachment = nem.model.objects.create('mosaicAttachment')(mosaicObj.namespace, mosaicObj.mosaic, amount);
  
  // Create transfer object
  let transferTransaction = nem.model.objects.create('transferTransaction')(address, null, message);

  transferTransaction.mosaics.push(mosaicAttachment);
  
  const fullMosaicName  = nem.utils.format.mosaicIdToName(mosaicAttachment.mosaicId);

  // Pull definition for our Mosaic
  const mosaicDefinition = await nem.com.requests.namespace.mosaicDefinitions(endpoint, mosaicAttachment.mosaicId.namespaceId);
  const neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(mosaicDefinition.data, ['minutes']);
    
  // Create definition meta data pair
  let mosaicDefinitionMetaDataPair = nem.model.objects.get('mosaicDefinitionMetaDataPair');
  mosaicDefinitionMetaDataPair[fullMosaicName] = {};
  mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];

  // Prepare transaction object
  let transactionEntity = nem.model.transactions
    .prepare('mosaicTransferTransaction')(common, transferTransaction, mosaicDefinitionMetaDataPair, nem.model.network.data.testnet.id);

  // Set the fee for transaction (increasing value makes transaction execution faster)
  transactionEntity.fee = config.nem.txFee;
  // console.log(common, transactionEntity, endpoint);

  return nem.model.transactions.send(common, transactionEntity, endpoint);
};

module.exports = {makeBonusTransfer};
