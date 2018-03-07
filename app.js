const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')

const targetsRoutes = require('./api/routes/targets');
const topsRoutes = require('./api/routes/tops');
const usersRoutes = require('./api/routes/users');
const doingsRoutes = require('./api/routes/doings');

// heroku auth:token
// Use the result as the password when prompted.

mongoose.connect(
  'mongodb://nodejs-rest:' +
    process.env.MONGO_ATLAS_PW +
    '@nodejs-rest-shard-00-00-vwe6k.mongodb.net:27017,nodejs-rest-shard-00-01-vwe6k.mongodb.net:27017,nodejs-rest-shard-00-02-vwe6k.mongodb.net:27017/test?ssl=true&replicaSet=nodejs-rest-shard-0&authSource=admin',
  {
    useMongoClient: true
  }
);
mongoose.Promise = global.Promise;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept, X-Access-Token, X-Key, Z-Key');
  if (req.method === 'OPTIONS') {
    console.log(req.method);
    res.header('Access-Control-Allow-Methods', 'OPTIONS', 'DELETE', 'PUT', 'POST', 'PATCH', 'GET');
    return res.status(200).json();
  }
  next();
})

app.use('/targets', targetsRoutes);
app.use('/tops', topsRoutes);
app.use('/users', usersRoutes);
app.use('/doings', doingsRoutes);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app;
