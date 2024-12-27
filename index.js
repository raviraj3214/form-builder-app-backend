const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception 💥');
  console.log(err.name);

  process.exit(1);
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ Connected to database');
});

const server = app.listen(process.env.PORT, () => {
  console.log('listening on port ' + process.env.PORT);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection 💥');
  console.log(err.name, err.message);

  server.close(() => process.exit(1));
});
