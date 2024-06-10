// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

// const users = [
//   { userId: 1, username: 'user1', password: 'password1' },
//   { userId: 2, username: 'user2', password: 'password2' }
// ];

// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(u => u.username === username && u.password === password);

//   if (user) {
//     res.status(200).json({ message: 'Login successful', userId: user.userId });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// const port = 3005;
// app.listen(port, () => {
//   console.log(`Authentication Service listening on port ${port}`);
// });


// const express = require('express');
// const redis = require('redis');
// const amqp = require('amqplib/callback_api');

// const app = express();
// app.use(express.json());

// const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`;

// const users = [
//   { userId: 1, username: 'user1', password: 'password1' },
//   { userId: 2, username: 'user2', password: 'password2' }
// ];

// app.post('v1/login', (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(u => u.username === username && u.password === password);

//   if (user) {
//     redisClient.set(`user_${user.userId}`, JSON.stringify(user), (err, reply) => {
//       if (err) {
//         console.error('Redis Error:', err);
//         return res.status(500).json({ error: 'Internal Server Error' });
//       }

//       amqp.connect(rabbitmqUrl, (err, conn) => {
//         if (err) {
//           console.error('RabbitMQ Connection Error:', err);
//           return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         conn.createChannel((err, channel) => {
//           if (err) {
//             console.error('RabbitMQ Channel Error:', err);
//             return res.status(500).json({ error: 'Internal Server Error' });
//           }

//           const queue = 'login_notifications';
//           const msg = `User ${user.username} logged in`;

//           channel.assertQueue(queue, { durable: false });
//           channel.sendToQueue(queue, Buffer.from(msg));
//           console.log(` [x] Sent '${msg}'`);

//           res.status(200).json({ message: 'Login successful', userId: user.userId });
//         });
//       });
//     });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// const port = 3005;
// app.listen(port, () => {
//   console.log(`Authentication Service listening on port ${port}`);
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

app.post('/v1/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      const user = results[0];
      redisClient.set(`user_${user.userId}`, JSON.stringify(user), (err, reply) => {
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

            const queue = 'login_notifications';
            const msg = `User ${user.username} logged in`;

            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(` [x] Sent '${msg}'`);

            res.status(200).json({ message: 'Login successful', userId: user.userId });
          });
        });
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

const port = 3005;
app.listen(port, () => {
  console.log(`Authentication Service listening on port ${port}`);
});
