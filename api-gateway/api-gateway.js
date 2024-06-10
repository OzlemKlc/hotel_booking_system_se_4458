const express = require('express');
const httpProxy = require('http-proxy');
const mysql = require('mysql2');
const redis = require('redis');
//const bodyParser = require('body-parser'); // body-parser eklendi

const app = express();
const proxy = httpProxy.createProxyServer();

const serviceAUrl = 'http://service-A:3001';
const serviceBUrl = 'http://service-B:3002';
const serviceCUrl = 'http://service-C:3003';
const serviceDUrl = 'http://service-D:3004';
const serviceEUrl = 'http://service-E:3005';


// Middleware to parse JSON bodies
//app.use(bodyParser.json()); // JSON gövdeleri için body-parser kullanıldı
// Middleware to parse JSON bodies
app.use(express.json());


// Add/Update Room endpoint (Admin Service)
app.post('v1/admin/add-room', (req, res) => {
    proxy.web(req, res, { target: serviceAUrl }, (err) => {
      console.error(`Error forwarding request to Admin Service: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  });
  
  // Search Hotels endpoint (Search Service)
  app.get('v1/search', (req, res) => {
    proxy.web(req, res, { target: serviceBUrl }, (err) => {
      console.error(`Error forwarding request to Search Service: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  });
  
  // Book Hotel endpoint (Booking Service)
  app.post('v1/book', (req, res) => {
    proxy.web(req, res, { target: serviceCUrl }, (err) => {
      console.error(`Error forwarding request to Booking Service: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  });
  
  // Notification Service endpoint
  app.get('v1/notify', (req, res) => {
    proxy.web(req, res, { target: serviceDUrl }, (err) => {
      console.error(`Error forwarding request to Notification Service: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  });
  
  // User login endpoint (Authentication Service)
  app.post('v1/login', (req, res) => {
    proxy.web(req, res, { target: serviceEUrl }, (err) => {
      console.error(`Error forwarding request to Authentication Service: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    });
  });


// Add this middleware to log the request received by the proxy
proxy.on('proxyReq', function (proxyReq, req, res, options) {
  console.log(`Received request to ${options.target.href}: ${req.method} ${req.url}`);
});

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
