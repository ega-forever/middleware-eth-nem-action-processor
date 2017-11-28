/** 
 * Bootstrap file for rescursive search & exposing models
 * @returns {Object} models
 */

const requireAll = require('require-all');

module.exports = requireAll({
  dirname     :  __dirname,
  filter      :  /(.+Model)\.js$/,
});
