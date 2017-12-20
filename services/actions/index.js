/** 
 * Bootstrap file for rescursive search & exposing actions
 * @returns {Object} action service
 */

const requireAll = require('require-all');

module.exports = requireAll({
  dirname     :  __dirname,
  filter      :  /(.+Action)\.js$/,
  map         :  name => name.replace(/Action$/,'')
});
