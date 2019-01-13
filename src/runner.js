const createMainStrat = require("./chicken2.js").createImpl;
const hit_probability = require("./chicken2.js").hit_probability;
const nash_balance_stategry = require("./chicken2.js").nash_balance_stategry;

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
            result.push(new ChickenGame(gameCounter++, generateChickenMatrix(), [strat1, strat2], getRandomArbitrary(0.001, 0.01)));
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
        this.movesCount++;
        // console.log(`result on move ${this.movesCount}: ${this.result}`);
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
    constructor(impl, name) {
        this.send = impl;
        this.name = name;
    }
}


const chickenStrategies = [
    // new Strategy(createMainStrat(d => d), "main"), 
    new Strategy(createSuperStrategy(d => d), "super"),
    new Strategy(createLobanovBot(d => d), "lobanov"),
];

let _games = [];

for (let i = 0; i < 10; i++) {
    _games = _games.concat(createChickenGames(chickenStrategies));
}

// console.log(chickenStrategies[1].send(formatMessage({ state: 'start', game: 1, hand: 0, parameters: { payoff: generateChickenMatrix() } })));
// console.log(_games);

_games.forEach(g => g.play());
_games.forEach(g => console.log(`game: ${g.number}, strategies: ${g.strategies.map(s => s.name)} scores = ${g.scores()}, movesCound: ${g.movesCount}`));

const overallResults = {};

_games.forEach(g => {
    g.strategies.forEach((s, i) => {
        if (!overallResults.hasOwnProperty(s.name)) {
            overallResults[s.name] = {scoreSum: 0, gamesCount: 0};
        }
        overallResults[s.name].scoreSum += g.scores()[i];
        overallResults[s.name].gamesCount++;
    })
})

for (let strategyName in overallResults) {
    console.log(`strategy: ${strategyName}, avg result: ${overallResults[strategyName].scoreSum / overallResults[strategyName].gamesCount}`);
}

// const games = {};

function createSuperStrategy(send) {
    const games = {};
    return function(msg) {
        const message = JSON.parse(msg.utf8Data);
        if (message.state === 'start') {
            games[message.game] = {message, moves: 1};
            
            games[message.game].movesHistory = [];

            const balance = nash_balance_stategry(games[message.game].message);
            const strategy = hit_probability(balance) ? 1 : 0;
            return send({game:message.game, state:'move', strategy: 0});
        }
    
        if (message.state === 'turnover') {
// ------
            addMove(message);
            const game2 = games[message.game];

            if (game2.isMirrorAroundGamer) {
                return send({game: message.game, state: "move", strategy: 1});
            }
// --------
            const game = games[message.game];
            const balance = nash_balance_stategry(game.message);

            if (message.moves[(game.hand + 1) % 2] == 1) {
                game.moves = 1;
            }
    
            if (game.moves * (balance - balance**2) < 0.8) {
                game.moves++;
                return send({game:message.game, state:'move', strategy: 1});
            }

            return send({game:message.game, state:'move', strategy: 0});
        }
    
        if (message.state === 'gameover') {
            console.log(message.game + ' is over');
        }

        function addMove(message) {
            games[message.game].movesHistory.push(message.moves);
            const moves = games[message.game].movesHistory;
            const hand = games[message.game].hand;
    
            if (moves.length < 7) {
                return;
            }
    
            let isMirrorAroundGamer = true;
    
            for (let i = moves.length - 6; i < moves.length - 1; i++) {
                if (moves[i][hand] === moves[i + 1][(hand + 1) % 2]) {
                    isMirrorAroundGamer = false;
                    break;
                }
            }
    
            games[message.game].isMirrorAroundGamer = isMirrorAroundGamer;
        }
    }
}

function createLobanovBot(send) {
    const games = {};
    return function(msg) {
        const message = JSON.parse(msg.utf8Data);
        if (message.state === 'start') {
            games[message.game] = {message, moves: 1};

            return send({game:message.game, state:'move', strategy: 1});
        }
    
        if (message.state === 'turnover') {
            const game = games[message.game];
            const opponentsMove = message.moves[(game.hand + 1) % 2];

            return send({game:message.game, state:'move', strategy: opponentsMove === 1 ? 0 : 1 });
        }
    
        if (message.state === 'gameover') {
            console.log(message.game + ' is over');
        }
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