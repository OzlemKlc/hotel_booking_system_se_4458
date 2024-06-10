// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

// app.get('/notify', (req, res) => {
//   // Sample notification logic
//   console.log('Notification sent to hotel administrators');
//   res.status(200).send('Notification sent');
// });

// const port = 3004;
// app.listen(port, () => {
//   console.log(`Notification Service listening on port ${port}`);
// });

// const express = require('express');
// const redis = require('redis');
// const amqp = require('amqplib/callback_api');

// const app = express();
// app.use(express.json());

// const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`;

// app.get('v1/notify', (req, res) => {
//   amqp.connect(rabbitmqUrl, (err, conn) => {
//     if (err) {
//       console.error('RabbitMQ Connection Error:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }

//     conn.createChannel((err, channel) => {
//       if (err) {
//         console.error('RabbitMQ Channel Error:', err);
//         return res.status(500).json({ error: 'Internal Server Error' });
//       }

//       const queue = 'notifications';
//       const msg = 'Notification sent to hotel administrators';

//       channel.assertQueue(queue, { durable: false });
//       channel.sendToQueue(queue, Buffer.from(msg));
//       console.log(` [x] Sent '${msg}'`);

//       res.status(200).send('Notification sent');
//     });
//   });
// });

// const port = 3004;
// app.listen(port, () => {
//   console.log(`Notification Service listening on port ${port}`);
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

app.get('/notify', (req, res) => {
  const query = 'SELECT * FROM bookings WHERE capacity < 20';
  db.query(query, (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
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

        const queue = 'notifications';
        const msg = 'Notification sent to hotel administrators';

        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(msg));
        console.log(` [x] Sent '${msg}'`);

        res.status(200).send('Notification sent');
      });
    });
  });
});

const port = 3004;
app.listen(port, () => {
  console.log(`Notification Service listening on port ${port}`);
});
