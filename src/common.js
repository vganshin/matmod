function isOponnentMirror(game) {
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

function isOponnentAntiMirror(game) {
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

module.exports = {
  isOponnentMirror,
  isOponnentAntiMirror
}
