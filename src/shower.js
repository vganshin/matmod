const fs = require('fs');
const helpers = require('./helpers');

const gameFiles = fs.readdirSync('games/chicken').filter(filename => filename.endsWith('.json'));


console.log(`ID\tMOVES\tTERM%\t\t\tMY_SCORE\t\tOP_SCORE\t\tA\t\t\tB\t\t\tB/A`);


gameFiles.forEach(gameFile => {
    const game = JSON.parse(fs.readFileSync(`games/chicken/${gameFile}`));

    const myHand = helpers.myHand(game);
    const myScore = game.moves
      .map(moves => game.parameters.payoff[moves[0]][moves[1]])
      .map(scores => scores[myHand])
      .reduce((acc, score) => acc + score, 0) / game.moves.length;

    const opHand = helpers.opHand(game);
    const opScore = game.moves
      .map(moves => game.parameters.payoff[moves[0]][moves[1]])
      .map(scores => scores[opHand])
      .reduce((acc, score) => acc + score, 0) / game.moves.length;

    const a = Math.abs(game.parameters.payoff[1][0][1]);
    const b = Math.abs(game.parameters.payoff[1][1][1]);
    console.log(`${game.game
    }\t${game.moves.length}\t${game.parameters.termination_probability}\t${myScore}\t${opScore}\t${a}\t${b}\t${b / a}`);
});