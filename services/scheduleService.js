/**
 * Ping IPFS by specified time in config
 * @module services/scheduleService
 * @see module:config
 */

const schedule = require('node-schedule'),
  accountModel = require('../models/accountModel'),
  blockModel = require('../models/blockModel'),
  _ = require('lodash'),
  bunyan = require('bunyan'),
  config = require('../config'),
  Promise = require('bluebird'),
  welcomeBonusAction = require('./actions/welcomeBonusAction'),
  timeBonusAction = require('./actions/timeBonusAction'),
  log = bunyan.createLogger({name: 'plugins.nem_action_processor.scheduleService'});

module.exports = () => {

  let isPending = false;
  let rule = new schedule.RecurrenceRule();
  _.merge(rule, config.schedule.job);

  schedule.scheduleJob(rule, async () => {

    if (isPending)
      return log.info('still sending bonuses...');

    log.info('sending bonuses...');
    const accounts = await accountModel.find({nem: {$ne: null}});
    const filtered = await blockModel.aggregate([
      {
        $project: {
          account: accounts
        }
      },
      {$unwind: '$account'},
      {
        $lookup: {
          from: 'sethashes',
          localField: 'account.address',
          foreignField: 'key',
          as: 'sethash'
        }
      },
      {
        $lookup: {
          from: 'deposits',
          localField: 'account.address',
          foreignField: 'who',
          as: 'deposit'
        }
      },
      {
        $project: {
          address: '$account.address',
          nem: '$account.nem',
          deposit: '$deposit',
          deposit_count: {$size: '$deposit'},
          sethash: '$sethash',
          sethash_count: {$size: '$sethash'},
          welcomeBonusSent: '$account.welcomeBonusSent',
          maxTimeDeposit: '$account.maxTimeDeposit',
          maxFoundDeposit: {$max: '$deposit.amount'},
          maxDepEq: {
            $lte: [
              {$ifNull: [{$max: '$deposit.amount'}, 0]},
              {$ifNull: [{$max: '$account.maxTimeDeposit'}, 0]}
            ]
          }
        }
      },
      {
        $match: {
          $or: [
            {sethash_count: {$gt: 0}, welcomeBonusSent: {$ne: true}},
            {deposit_count: {$gt: 0}, maxDepEq: false}
          ]
        }
      }
    ]);

    const welcomeBonusSets = _.filter(filtered, item => !item.welcomeBonusSent);
    const depositSets = _.filter(filtered, item => !item.maxDepEq);

    const welcomeBonusResult = await Promise.mapSeries(welcomeBonusSets, async set => {
      return await welcomeBonusAction(set.address, config.nem.welcomeBonus.amount, set.nem).catch(e => log.error(e));
    });

    const depositBonusResult = await Promise.mapSeries(depositSets, async set => {
      return await timeBonusAction(set.address, set.maxTimeDeposit, set.maxFoundDeposit, set.nem).catch(e => log.error(e));
    });

    if (_.compact(welcomeBonusResult).length !== welcomeBonusSets.length ||
      _.compact(depositBonusResult).length !== depositBonusResult.length) {
      log.info('some of binues hasn\'t been processed!');
    } else {
      log.info('bonuses has been sent!');
    }

    isPending = false;

  });

};
