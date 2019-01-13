const helpers = require('../helpers');

function rootStrategy(game) {
    if (helpers.moveCount(game) === 1) {
        return 1;
    }

    const ones = game.moves[game.moves.length - 1].reduce((accumulator, currentValue) => accumulator + currentValue);
    return ones > 2 ? 0 : 1;
}

module.exports = rootStrategy;
