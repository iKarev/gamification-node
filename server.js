const http = require('http');
const app = require('./app');
const morgan = require('morgan');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port);