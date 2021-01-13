const express = require('express');

const quotes = require('./quotes.json');

const app = express();

app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/quote', (req, res) => {
  const index = randomIntFromInterval(0, quotes.length - 1);
  res.send({ data: quotes[index] });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
