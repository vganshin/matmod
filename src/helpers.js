function isOpponentMirror(game) {
  const moves = game.moves;
  const hand = game.hand;

  if (moves.length < 7) {
      return undefined;
  }

  for (let i = moves.length - 6; i < moves.length - 1; i++) {
      if (moves[i][hand] !== moves[i + 1][(hand + 1) % 2]) {
          return false;
      }
  }

  return true;
}

function isOpponentAntiMirror(game) {
  const moves = game.moves;
  const hand = game.hand;

  if (moves.length < 7) {
      return undefined;
  }

  for (let i = moves.length - 6; i < moves.length - 1; i++) {
      if (moves[i][hand] === moves[i + 1][(hand + 1) % 2]) {
          return false;
      }
  }

  return true;
}

function opHand(game) {
  return (game.hand + 1) % 2;
}

function myHand(game) {
  return game.hand;
}

function moveCount(game) {
  return game.moves.length + 1;
}

function lastOpponentsMove(game) {
  if (game.moves.length === 0) {
    return undefined;
  }
  return game.moves[game.moves.length - 1][opHand(game)];
}

function nash_balance_stategy(game) {
    return game.parameters.payoff[1][0][1] / game.parameters.payoff[1][1][1];
}

module.exports = {
  isOpponentMirror,
  isOpponentAntiMirror,
  opHand,
  myHand,
  lastOpponentsMove,
  moveCount,
  nash_balance_stategy
}
