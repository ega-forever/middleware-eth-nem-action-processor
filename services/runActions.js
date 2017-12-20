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
const loadContracts = (contractPath, provider, contracts) => 
  _.chain(contracts)
    .transform((acc, name) => {
      const contr = require(path.join(contractPath.path, `${name}.json`));
      acc[name] = contract(contr);
      acc[name].setProvider(provider);
    }, {})
    .value();

// Load & init required contracts by truffle
const contracts = loadContracts(config.smartContracts, provider, ['ERC20Interface', 'ERC20Manager', 'UserManager']);
    
module.exports = ctx => {
  const defaultActions = config.nem.actions || [];
  ctx = _.assign(ctx, {contracts});
  
  let obj = _.chain(defaultActions)
    .intersection(_.keys(actions))
    .map(a => {
      const act = actions[a];
      const events = _.get(act, 'events', []);

      if(events.indexOf(ctx.event.name) !== -1) {
        return act.run.call(ctx);
      }
    })
    .value();
  
  return Promise.all(obj)
    .then(res => console.log(res))
    .catch(err => console.error(err));
};
