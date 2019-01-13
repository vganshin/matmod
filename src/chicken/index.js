const helpers = require('../helpers');

function rootStrategy(game) {
  if (helpers.moveCount(game) === 4) {
    return 0;
  }
  return 1;
}

module.exports = rootStrategy;
