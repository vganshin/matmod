const helpers = require('../helpers');

function rootStrategy(game) {
  if (helpers.isOpponentMirror(game)) {
    return 1;
  }
  return helpers.lastOpponentsMove(game);
}

module.exports = rootStrategy;