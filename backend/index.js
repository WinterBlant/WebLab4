var express = require('express');
var app = express();
var axios = require('axios')
var cors = require('cors')
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
var dbname = 'weatherapp';
var APIkey = '28b4ff63e143043a4cf62a826e7449ea';

app.use(express.json());
app.use(cors())

app.get('/weather/coordinates', async function (req, res) {
  try {
    const result = await axios({
      url: 'https://api.openweathermap.org/data/2.5/weather',
      responseType: 'json',
      method: 'get',
      params: {
        lat: req.query.lat,
        lon: req.query.lon,
        appid: APIkey
      }
    });
    return res.json(result.data);
  } catch (error) {
    return res.status(404).send(error);
  }
});

app.get('/weather', async function (req, res) {
  try {
    const result = await axios({
      url: 'https://api.openweathermap.org/data/2.5/weather',
      responseType: 'json',
      method: 'get',
      params: {
        q: req.query.q.trim(),
        appid: APIkey
      }
    });
    return res.json(result.data);
  } catch (error) {
    return res.status(404).send(error);
  }
});

app.post('/favourites/:cityName', async function (req, res) {
  mongo.connect(url, function (err, client) {
    if (!err) {
      console.log("Connected successfully to server");
      const collection = client.db(dbname).collection('cities')
      collection.findOne({ cityName: req.params.cityName.trim() }, function (err, result) {
        if (!err) {
          if (!result) {
            collection.insertOne({ cityName: req.params.cityName.trim() }, function (err) {
              if (err) {
                client.close();
                return res.status(400).send('Something happened during sending requests to database')
              };
            });
            client.close();
            return res.status(200).send();
          } else {
            client.close();
            return res.status(409).send('City already exists');
          }
        } else {
          client.close();
          return res.status(400).send('Something happened during sending requests to database');
        }
      });
    } else {
      client.close();
      return res.status(400).send('Bad connection to database');
    }
  });
});

app.get('/favourites', async function (req, res) {
  mongo.connect(url, function (err, client) {
    if (!err) {
      console.log("Connected successfully to server");
      const collection = client.db(dbname).collection('cities')
      collection.find({}, { projection: { _id: 0 } }).toArray(function (err, result) {
        if (!err) {
          return res.json(result);
        } else {
          client.close();
          return res.status(400).send('Something happened during sending requests to database');
        }
      });
    } else {
      client.close();
      return res.status(400).send('Bad connection to database');
    }
  });
})

app.delete('/favourites/:cityName', async function (req, res) {
  mongo.connect(url, function (err, client) {
    if (!err) {
      console.log("Connected successfully to server");
      const collection = client.db(dbname).collection('cities')
      collection.deleteOne({ cityName: req.params.cityName.trim() }, function (err) {
        if (err) {
          client.close();
          return res.status(400).send('Something happened during sending requests to database')
        } else {
          client.close();
          return res.status(200).send();
        }
      })
    } else {
      client.close();
      return res.status(400).send('Bad connection to database');
    }
  });
});

var port = 3001;
app.listen(port);