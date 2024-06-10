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

    channel.assertQueue(queue, { durable: false });
    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    channel.consume(queue, (msg) => {
      console.log(` [+] Received ${msg.content.toString()}`);
    }, { noAck: true });
  });
});
