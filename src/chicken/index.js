const helpers = require('../helpers');

function rootStrategy(game) {
  // init actions
  if (helpers.moveCount(game) === 1) {
      game.agressiveMoves = 1;
      return 0;
  }

  // CATCH LOVER
  if (helpers.moveCount(game) === 4) {
    let ones = 0;

    for (let i = 0; i < 3; i++) {
      ones += game.moves[i][helpers.opHand(game)];
    }

    if (ones === 3) {
      game.isLover = true;
      return 0;
    }
  }

  if (helpers.moveCount(game) === 5 && game.isLover) {
    if (helpers.lastOpponentsMove(game) !== 0) {
      game.isLover = false;
    }
  }

  if (game.isLover) {
    return 1;
  }
  // END CATCH LOVER

  // CATCH ANTI-MIRROR GAMER
  if (helpers.isOpponentAntiMirror(game)) {
    return 1;
  }

  // -- workarounds end here

  const balance = helpers.nash_balance_stategy(game);

  if (helpers.lastOpponentsMove(game) === 1) {
      game.agressiveMoves = 1;
  }

  if (game.agressiveMoves * (balance - balance**2) < 0.8) {
      game.agressiveMoves++;
      return 1;
  }

  return 0;
}

module.exports = rootStrategy;
