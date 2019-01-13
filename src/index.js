const Client = require('./client').Client;
const prisonerStrategy = require('./prisoner/index');

const gameName = process.argv[2];
const debug = process.argv[3] === 'release' ? false : true;

if (gameName === 'prisoner') {
  const client = new Client(gameName, prisonerStrategy, debug);
  client.connect();
} else if (gameName === 'chicken') {
  const client = new Client(gameName, game => 1, debug);
  client.connect();
} else if (gameName === 'goods') {
  const client = new Client(gameName, prisonerStrategy, debug);
  client.connect();
}






