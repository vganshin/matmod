const createMainStrat = require("./chicken2.js").createImpl;
const hit_probability = require("./chicken2.js").hit_probability;

let gameCounter = 0;

function generateChickenMatrix() {
    const a = getRandomArbitrary(0, 0.8);
    const b = a * getRandomArbitrary(10, 12) * getRandomArbitrary(1, 2);
    return [[[0, 0], [-a, a]], [[a, -a], [-b, -b]]];
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function formatMessage(data) {
    return { utf8Data: JSON.stringify(data), type: 'utf8' };
}

function createChickenGames(strategies) {
    const result = [];
    
    for (let i = 0; i < strategies.length - 1; i++) {
        const strat1 = strategies[i];
        for (let j = i + 1; j < strategies.length; j++) {
            const strat2 = strategies[j];
            result.push(new ChickenGame(gameCounter++, generateChickenMatrix(), [strat1, strat2], getRandomArbitrary(0.0001, 0.001)));
        }
    }

    return result;
}

class Game {
    constructor(number, matrix, strategies, prob) {
        this.number = number;
        this.matrix = matrix;
        this.strategies = strategies;
        this.prob = prob;

        this.result = new Array(strategies.length).fill(0);
        this.movesCount = 0;
    }

    scores() {
        return this.result.map(r => r / this.movesCount);
    }
}

class ChickenGame extends Game {
    updateResult(moves) {
        this.result[0] += this.matrix[moves[0].strategy][moves[1].strategy][0];
        this.result[1] += this.matrix[moves[0].strategy][moves[1].strategy][1];
        console.log(`result on move ${this.movesCount++}: ${this.result}`);
    }
    
    play() {
        const startMoves = [];
        this.strategies.forEach((s, i) => {
            startMoves.push(
                s.send(
                    formatMessage({ state: 'start', game: this.number, hand: i, parameters: { payoff: this.matrix } })
                )
            );
        });
        this.updateResult(startMoves);
    
        let oldMoves = startMoves;
        while (Math.random() > this.prob) {
            const newMoves = []
            this.strategies.forEach(s =>
                newMoves.push(
                    s.send(formatMessage({ state: 'turnover', game: this.number, moves: oldMoves }))
                )
            );
            oldMoves = newMoves;
            this.updateResult(oldMoves);
        }
    
        this.strategies.forEach(s => s.send(formatMessage({ state: 'gameover', game: this.number, scores: super.scores() })));
    
        return this;
    }
}

class Strategy {
    constructor(impl) {
        this.send = impl;
    }
}


const chickenStrategies = [new Strategy(createMainStrat(d => d)), new Strategy(createMainStrat(d => d))]

const games = createChickenGames(chickenStrategies);

games.forEach(g => g.play());
games.forEach(g => console.log(`game ${g.number} scores = ${g.scores()}`));

const games = {};

function superStrategy() {
    if (message.state === 'start') {
        games[message.game] = {message, moves: 1};
        const balance = nash_balance_stategry(games[message.game].message);
        const strategy = hit_probability(balance) ? 1 : 0;
        return send({game:message.game, state:'move', strategy});
    }

    if (message.state === 'turnover') {
        const game = games[message.game];
        const balance = nash_balance_stategry(game.message);

        if (game.moves * (balance - balance**2) > 0.8) {
            send({game:message.game, state:'move', strategy: 1})
        }

        const strategy = hit_probability(balance) ? 1 : 0;

        return send({game:message.game, state:'move', strategy});
    }

    if (message.state === 'gameover') {
        console.log(message.game + ' is over');
    }
}


// const chickenGame = new Game(0, generateChickenMatrix(), chickenStrategies, getRandomArbitrary(0.0001, 0.001));

// playGame(chickenGame)
// console.log(scores(chickenGame));


// console.log(JSON.stringify(chickenGame));

// console.log(formatMessage({ state: 'start', game: chickenGame.number, hand: 0, parameters: { payoff: [chickenGame.matrix] } }));

// console.log(playGame(chickenGame));

// console.log(typeof(chickenGame.result[0]))

// let moves = [{strategy: 0}, {strategy: 1}];


// chickenGame.result[0] += chickenGame.matrix[moves[0].strategy, moves[1].strategy][0];

// console.log(chickenGame.result)



// console.log(generateChickenMatrix());