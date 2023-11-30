const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { json } = require('express');

const app = express();


const newspappers = [
  {
    name: 'Thetimes',
    address: 'https://www.thetimes.co.uk/environment/climate-change',
    base: ''
  },
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
  },
  {
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/climate-change/',
    base: 'https://www.telegraph.co.uk'
  }
]
const articles = [];

newspappers.forEach(newspapper => {
  axios.get(newspapper.address)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');
        articles.push({
          title,
          url: newspapper.base + url,
          source: newspapper.name
        });
      });
    })
});

app.get('/news', (req, res) => {
  res.json(articles);
});

app.get('/news/:newspapperId', (req, res) => {
  const newspapperId = req.params.newspapperId;

  const newspapperAddress = newspappers.filter(newspapper => newspapper.name === newspapperId)[0].address;
  const newspapperBase = newspappers.filter(newspapper => newspapper.name === newspapperId)[0].base

  axios.get(newspapperAddress)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');
        specificArticles.push({
          title,
          url: newspapperBase + url,
          source: newspapperId
        });
      });
      res.json(specificArticles);
    }).catch(err => {
      console.log(err);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));