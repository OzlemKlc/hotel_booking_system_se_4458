// // const express = require('express');

// // const app = express();
// // const port = 3001;




// // app.listen(port, () => {
// //     console.log(`Service A listening on port ${port}`);
// //   });
  

// const express = require('express');
// const bodyParser = require('body-parser');


// const app = express();
// app.use(bodyParser.json());

// let rooms = []; // Sample in-memory storage for rooms

// app.post('/admin/add-room', (req, res) => {
//   const { roomId, roomDetails } = req.body;
//   const existingRoomIndex = rooms.findIndex(room => room.roomId === roomId);

//   if (existingRoomIndex !== -1) {
//     rooms[existingRoomIndex] = { roomId, ...roomDetails };
//     res.status(200).send('Room updated successfully');
//   } else {
//     rooms.push({ roomId, ...roomDetails });
//     res.status(201).send('Room added successfully');
//   }
// });

// const port = 3001;
// app.listen(port, () => {
//   console.log(`Admin Service listening on port ${port}`);
// });


// const express = require('express');
// const redis = require('redis');
// const amqp = require('amqplib/callback_api');

// const app = express();
// app.use(express.json());

// const redisClient = redis.createClient({ host: process.env.REDIS_HOST });
// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`;

// app.post('v1/admin/add-room', (req, res) => {
//   const { roomId, roomDetails } = req.body;
//   redisClient.set(`room_${roomId}`, JSON.stringify(roomDetails), redis.print);

//   amqp.connect(rabbitmqUrl, (err, conn) => {
//     if (err) {
//       console.error(err);
//     } else {
//       conn.createChannel((err, channel) => {
//         if (err) {
//           console.error(err);
//         } else {
//           const queue = 'room_updates';
//           const msg = JSON.stringify({ roomId, roomDetails });

//           channel.assertQueue(queue, { durable: false });
//           channel.sendToQueue(queue, Buffer.from(msg));
//           console.log(" [x] Sent '%s'", msg);
//         }
//       });
//     }
//   });

//   res.status(201).send('Room added/updated');
// });


// app.listen(port, () => {
//   console.log(`Admin Service listening on port ${port}`);
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

app.post('/admin/add-room', (req, res) => {
  const { roomId, roomDetails } = req.body;

  const query = 'INSERT INTO rooms (id, details) VALUES (?, ?) ON DUPLICATE KEY UPDATE details = VALUES(details)';
  db.query(query, [roomId, JSON.stringify(roomDetails)], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    redisClient.set(`room_${roomId}`, JSON.stringify(roomDetails), (err, reply) => {
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

          const queue = 'room_updates';
          const msg = JSON.stringify({ roomId, roomDetails });

          channel.assertQueue(queue, { durable: false });
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log(` [x] Sent '${msg}'`);

          res.status(201).json({ message: 'Room added/updated successfully' });
        });
      });
    });
  });
});


// Test endpoint
app.get('/test', (req, res) => {
  const testKey = 'test_key';
  const testValue = 'This is a test value';

  redisClient.set(testKey, testValue, (err, reply) => {
    if (err) {
      console.error('Redis SET Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    redisClient.get(testKey, (err, result) => {
      if (err) {
        console.error('Redis GET Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const query = 'SELECT 1 + 1 AS solution';
      db.query(query, (err, results) => {
        if (err) {
          console.error('MySQL Query Error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({
          message: 'Test successful',
          redisSet: reply,
          redisGet: result,
          mysqlQuery: results[0].solution,
        });
      });
    });
  });
});


const port = 3001;
app.listen(port, () => {
  console.log(`Admin Service listening on port ${port}`);
});
