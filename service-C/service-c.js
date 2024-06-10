// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

// let bookings = []; // Sample in-memory storage for bookings

// app.post('/book', (req, res) => {
//   const { roomId, userId, dates } = req.body;

//   bookings.push({ roomId, userId, dates });
//   res.status(200).send('Hotel booked successfully');
// });

// const port = 3003;
// app.listen(port, () => {
//   console.log(`Booking Service listening on port ${port}`);
// });


// const express = require('express');
// const redis = require('redis');
// const amqp = require('amqplib/callback_api');

// const app = express();
// app.use(express.json());

// const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`;

// app.post('v1/book', (req, res) => {
//   const { roomId, userId, dates } = req.body;
//   const bookingDetails = { roomId, userId, dates };

//   redisClient.set(`booking_${roomId}_${userId}`, JSON.stringify(bookingDetails), redis.print);

//   amqp.connect(rabbitmqUrl, (err, conn) => {
//     if (err) {
//       console.error(err);
//     } else {
//       conn.createChannel((err, channel) => {
//         if (err) {
//           console.error(err);
//         } else {
//           const queue = 'new_bookings';
//           const msg = JSON.stringify(bookingDetails);

//           channel.assertQueue(queue, { durable: false });
//           channel.sendToQueue(queue, Buffer.from(msg));
//           console.log(" [x] Sent '%s'", msg);
//         }
//       });
//     }
//   });

//   res.status(200).send('Hotel booked successfully');
// });

// const port = 3003;
// app.listen(port, () => {
//   console.log(`Booking Service listening on port ${port}`);
// });

const express = require('express');
const mysql = require('mysql2');
const redis = require('redis');
const amqp = require('amqplib/callback_api');

const app = express();
app.use(express.json());

const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`;

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

app.post('/book', (req, res) => {
  const { roomId, userId, dates } = req.body;
  const bookingDetails = { roomId, userId, dates };

  const query = 'INSERT INTO bookings (roomId, userId, dates) VALUES (?, ?, ?)';
  db.query(query, [roomId, userId, dates], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    redisClient.set(`booking_${roomId}_${userId}`, JSON.stringify(bookingDetails), (err, reply) => {
      if (err) {
        console.error('Redis Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      amqp.connect(rabbitmqUrl, (err, conn) => {
        if (err) {
          console.error('RabbitMQ Connection Error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        conn.createChannel((err, channel) => {
          if (err) {
            console.error('RabbitMQ Channel Error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          const queue = 'new_bookings';
          const msg = JSON.stringify(bookingDetails);

          channel.assertQueue(queue, { durable: false });
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log(` [x] Sent '${msg}'`);

          res.status(200).json({ message: 'Hotel booked successfully' });
        });
      });
    });
  });
});

const port = 3003;
app.listen(port, () => {
  console.log(`Booking Service listening on port ${port}`);
});
