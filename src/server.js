import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import logger from './utils/Logger';

require('dotenv').config();

const app = express();
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

app.use(cors());

//API ROUTES
require('./routes')(app);

// SETUP YOUR PORT
const port = process.env.DB_PORT;
const customHost = process.env.DB_HOST;
const host = customHost || null; 
const prettyHost = customHost || 'localhost';

// START YOUR APP
app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }
  
  logger.appStarted(port, prettyHost);

});
console.log(`Server started on port ${port}`);