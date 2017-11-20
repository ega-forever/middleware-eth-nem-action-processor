const accountModel = require('../models/accountModel'),
    fs = require('fs'),
    net = require('net'),
    Web3 = require('web3'),
    path = require('path'),
    config = require('../config'),
    requireAll = require('require-all'),
    contract = require('truffle-contract'),
    mongoose = require('mongoose');

let contracts = {},
    contractsPath = path.join(__dirname, '../node_modules', 'chronobank-smart-contracts/build/contracts');

if (fs.existsSync(contractsPath)) {
  //scan dir for all smartContracts, excluding emitters (except ChronoBankPlatformEmitter) and interfaces
  contracts = requireAll({
    dirname: contractsPath,
    filter: /(^((ChronoBankPlatformEmitter)|(?!(Emitter|Interface)).)*)\.json$/,
    resolve: Contract => contract(Contract)
  });
}

let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
const web3 = new Web3();

web3.setProvider(provider);

web3.currentProvider.connection.on('end', () => {
  log.error('ipc process has finished!');
  process.exit(0);
});

web3.currentProvider.connection.on('error', () => {
  log.error('ipc process has finished!');
  process.exit(0);
});

module.exports.checkCredit = async (name, who, amount) => {
  contracts.ERC20Manager.setProvider(provider);

  let token = await contracts.ERC20Manager.deployed()
    .catch(err => console.error(err));
  
  console.log(token);
  // let zz = await token.getTokenAddressBySymbol("TIME");
  // console.log(zz);

  // const user = await accountModel.findOne({address: who});
};


// const nemapi = require('nem-api'),
//     san = new nemapi('http://localhost:7890');

// const doSmth = () => {
//     san.post('/account/get', {address:'TBJIC6LRNUVXQSVPO3VZSH3MUYNP3IO4OQTI5IFD'}, resp => {
//         console.log(resp.body);
//     });

// };
