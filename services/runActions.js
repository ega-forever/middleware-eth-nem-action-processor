const accountModel = require('../models/accountModel'),
  _ = require('lodash'),
  net = require('net'),
  Web3 = require('web3'),
  path = require('path'),
  config = require('../config'),
  actions = require('./actions'),
  contract = require('truffle-contract');

const provider = new Web3.providers.IpcProvider(config.web3.uri, net);

// Contracts loader
const loadContracts = async (contractPath, provider, contracts) => 
  _.chain(contracts)
    .transform((acc, name) => {
      const contr = require(path.join(contractPath.path, `${name}.json`));
      acc[name] = contract(contr);
      acc[name].setProvider(provider);
    }, {})
    .value();

// Load & init required contracts by truffle
let contracts = {};
    
module.exports = ctx => {
  const defaultActions = config.nem.actions || [];
  
  let obj = _.chain(defaultActions)
    .intersection(_.keys(actions))
    .map(async a => {
      const act = actions[a];
      const events = _.get(act, 'events', []);
      const actContracts = _.get(act, 'contracts', []);

      if(events.indexOf(ctx.event.name) !== -1) {
        const obj = await loadContracts(config.smartContracts, provider, actContracts);
        _.defaults(ctx.contracts, contracts);

        return act.run.call(ctx);
      }
    })
    .value();
  
  return Promise.all(obj)
    .then(res => console.log(res))
    .catch(err => console.error(err));
};
