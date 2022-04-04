const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const message = `Duplicate field value: "${error.keyValue.name}". Please use another value!`;
  return new AppError(message, 400);
};

const handleValidatorDB = (error) => {
  const message = Object.values(error.errors)
    .map((el) => {
      return el.message;
    })
    .join(', ');
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token, please login again!', 401);
};

const handleJWTExpire = () => {
  return new AppError('Token has expired, please login again!', 401);
};
const sendErrorDev = (err, req, res) => {
  // send ERROR for API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //send ERROR for Views Rout
  return res.status(err.statusCode).render('error', {
    title: 'Some thing went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // send ERROR for API
  if (req.originalUrl.startsWith('/api')) {
    //cac loi do mk handle thong qua AppError
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR: ', err);

    // cac loi nhu network, programing, ...
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong💥!',
    });
  }
  // send ERROR for Views Rout in production
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Some thing went wrong!',
      msg: err.message,
    });
  }
  console.error('ERROR: ', err);

  return res.status(500).render('error', {
    title: 'Some thing went wrong!',
    msg: 'Please try it again!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // xử lý cast error do sai id
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidatorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpire();

    sendErrorProd(error, req, res);
  }
};
