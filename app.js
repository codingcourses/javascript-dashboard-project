const express = require('express');
const axios = require('axios');

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

app.get('/weather', async (req, res) => {
  const {
    data: {
      city,
      region_code: region,
      latitude,
      longitude,
    },
  } = await axios.get(`http://api.ipstack.com/check?access_key=${process.env.IPSTACK_API_KEY}`);

  const {
    data: {
      main: { temp },
      weather: [{ main: type }],
    },
  } = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHERMAP_API_KEY}`);

  const result = {
    location: `${city}, ${region}`,
    weather: {
      temp,
      type,
    },
  };

  res.send(result);
});

app.get('/background-image', async (req, res) => {
  const {
    data: {
      urls: {
        full: imageUrl,
      },
      user: {
        name: creatorName,
        links: {
          html: creatorUrl,
        },
      },
    },
  } = await axios.get(`http://api.unsplash.com/photos/random?collections=12292991&client_id=${process.env.UNSPLASH_API_KEY}`);

  const result = {
    imageUrl,
    creatorName,
    creatorUrl,
  };

  res.send(result);
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
