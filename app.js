const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRout = require('./routes/tourRout');
const userRout = require('./routes/userRout');
const reviewRout = require('./routes/reviewRout');
const viewRout = require('./routes/viewRout');

const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//setting security http header
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many req from this IP, please try again in an hours',
});
//gioi han req den tu 1 ip
app.use('/api', limiter);
//body parser, reading data from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//data sanitization against NoSQL query injection: nguoi dung co the truyen query vao body vd: {"email": {$gt: ""}} do vay can ngan chan cac truy van den tu nguoi dung
app.use(mongoSanitize());

//data sanitization against XSS: ngan nguoi dung dua vao code html vi du nhu name
app.use(xss());
//prevent parameter pollution ngan nguoi dung nhap trung field tren param url
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use('/', viewRout);
app.use('/api/v1/tours', tourRout);
app.use('/api/v1/users', userRout);
app.use('/api/v1/review', reviewRout);

app.all('*', (req, res, next) => {
  //   res.status(404).send({
  //     status: 'fail',
  //     message: `cant get this rout ${req.url}`,
  //   });
  //   throw new Error('this rout ${req.url} dont exist!');
  //   const err = new appError(`this rout ${req.url} dont exist!`, 500);
  next(new AppError(`this rout ${req.url} dont exist!`, 500));
});

app.use(errorController);

module.exports = app;
