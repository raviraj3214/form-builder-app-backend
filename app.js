const express = require('express');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');
const authRouter = require('./routes/authRoute');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const app = express();
app.use(cookieParser())
app.use(morgan('dev'));

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true      
}));
app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).send('Welcome to server');
});

app.get('/api/v1/', (req, res) => {
  return res.status(200).send('Explore version 1 of project manager server.');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  throw new AppError('Route does not exists', 404);
});

app.use(globalErrorHandler);

module.exports = app;
