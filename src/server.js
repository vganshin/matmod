const http = require('http');
const fs = require('fs');

server = new http.Server();

server.listen(8080, 'localhost');

var request;

server.on('request', function (req, res) {
  request = req;

  console.log(req.url);

  if (req.url === '/') {
    console.log('index.html');
    res.end(fs.readFileSync('index.html'));
  }

  if (req.url.startsWith('/api/games/chicken/')) {
    const game_id = req.url.match(/\d+/);
    console.log('chicken game ' + game_id);
    res.end(fs.readFileSync(`games/chicken/${game_id}.json`));
  }

  if (req.url === '/api/games/chicken') {
    console.log('list of chicken games');
    const data = fs.readdirSync('games/chicken')
      .filter(filename => filename.endsWith('.json'))
      .map(filename => filename.slice(0, -5))
      .map(filename => parseInt(filename));

    data.reverse();

    res.end(JSON.stringify(data));
  }

  res.end();

});
