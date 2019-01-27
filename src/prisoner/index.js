const helpers = require('../helpers');

function rootStrategy(game) {
  if (game.moves.length === 0) {
    return 1;
  }
  if (helpers.isOpponentMirror(game)) {
    return 1;
  }
  return helpers.lastOpponentsMove(game);
}

module.exports = rootStrategy;