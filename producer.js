const amqp = require('amqplib/callback_api');

const rabbitmqUrl = 'amqp://user:password@localhost';

amqp.connect(rabbitmqUrl, (err, conn) => {
  if (err) {
    throw err;
  }
  conn.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const queue = 'test_queue';
    const msg = 'Hello RabbitMQ';

    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(` [x] Sent '${msg}'`);

    setTimeout(() => {
      conn.close();
      process.exit(0);
    }, 500);
  });
});
