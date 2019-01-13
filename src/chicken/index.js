const helpers = require('../helpers');

function rootStrategy(game) {
  if (helpers.moveCount(game) === 1) {
      return 0;
  }

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

  if (helpers.isOpponentAntiMirror(game)) {
    return 1;
  }

  if (helpers.lastNOpponentsMoves(game, 2).every(i => i === 1)) {
    return 0;
  }

  console.log(`last2 opp moves: ${helpers.lastNOpponentsMoves(game, 2)}`);
  console.log(`last2 opp moves: ${helpers.lastNOpponentsMoves(game, 2)}`);

  let opponentAggressiveStrategyCount = countOpponentStrategies(game.moves, (game.hand + 1) %2)[1];
  opponentAggressiveStrategyCount = opponentAggressiveStrategyCount === undefined ? 0 : opponentAggressiveStrategyCount;
  const movesCount = game.moves.length;

  const lambda = (movesCount + 1) * (game.parameters.payoff[1][0][1] / game.parameters.payoff[1][1][1]);
  const k = opponentAggressiveStrategyCount + 1;

  const aggressiveProbabilty = (lambda ** k) * (Math.exp() ** (-lambda)) / factorial(k);
  
  if (aggressiveProbabilty > 0.7) {
    return 0;
  }

  return 1;
}



function factorial(n) {
  // console.log(`length ${n}`);
  return n === 0 ? 1 : Array(n).fill(null).map((e,i)=>i+1).reduce((p,c)=>p*c)
}

function countOpponentStrategies(moves, opponentHand) {
  const result = {};
  moves.forEach(m => {
    const opponentCurStrategy = m[opponentHand];

    if (!result.hasOwnProperty(opponentCurStrategy)) {
      result[opponentCurStrategy] = 0;
    }

    result[opponentCurStrategy] += 1;
  })

  return result;
}

module.exports = rootStrategy;
