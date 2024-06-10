// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

// let rooms = [
//   // Sample data
//   { roomId: 1, destination: 'CityA', availableDates: ['2023-07-01', '2023-07-10'], capacity: 2 },
//   { roomId: 2, destination: 'CityB', availableDates: ['2023-07-15', '2023-07-20'], capacity: 4 }
// ];

// app.get('/search', (req, res) => {
//   const { destination, dates, people } = req.query;
//   const searchResults = rooms.filter(room =>
//     room.destination === destination &&
//     room.availableDates.includes(dates) &&
//     room.capacity >= parseInt(people)
//   );
//   res.json(searchResults);
// });

// const port = 3002;
// app.listen(port, () => {
//   console.log(`Search Service listening on port ${port}`);
// });

// const express = require('express');
// const redis = require('redis');
// const amqp = require('amqplib/callback_api');

// const app = express();
// app.use(express.json());

// const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`;

// app.get('v1/search', (req, res) => {
//   const { destination, dates, people } = req.query;
//   const cacheKey = `search_${destination}_${dates}_${people}`;

//   redisClient.get(cacheKey, (err, reply) => {
//     if (reply) {
//       res.json(JSON.parse(reply));
//     } else {
//       // Gerçek arama işlemi burada yapılır (örnek veriyi sabit kodluyorum)
//       const searchResults = [{ roomId: 1, destination, dates, capacity: people }];
      
//       redisClient.set(cacheKey, JSON.stringify(searchResults), 'EX', 3600);
//       res.json(searchResults);
//     }
//   });
// });

// const port = 3002;
// app.listen(port, () => {
//   console.log(`Search Service listening on port ${port}`);
// });



const express = require('express');
const mysql = require('mysql2');
const redis = require('redis');

const app = express();
app.use(express.json());

const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

app.get('/search', (req, res) => {
  const { destination, dates, people } = req.query;
  const cacheKey = `search_${destination}_${dates}_${people}`;

  redisClient.get(cacheKey, (err, reply) => {
    if (err) {
      console.error('Redis Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (reply) {
      res.json(JSON.parse(reply));
    } else {
      const query = 'SELECT * FROM rooms WHERE destination = ? AND dates = ? AND capacity >= ?';
      db.query(query, [destination, dates, people], (err, results) => {
        if (err) {
          console.error('MySQL Error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        redisClient.set(cacheKey, JSON.stringify(results), 'EX', 3600);
        res.json(results);
      });
    }
  });
});

const port = 3002;
app.listen(port, () => {
  console.log(`Search Service listening on port ${port}`);
});
