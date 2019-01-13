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
  const moves = game.movesHistory;
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

function lastOpponentsMove(game) {
  return game.moves[game.moves.length - 1][opHand(game)];
}

module.exports = {
  isOpponentMirror,
  isOpponentAntiMirror,
  opHand,
  myHand,
  lastOpponentsMove
}
