const Client = require('./client').Client;
const prisonerStrategy = require('./prisoner/index');

const gameName = process.argv[2];

const client = new Client(gameName, prisonerStrategy);

client.connect();
