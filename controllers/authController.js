const crypto = require('crypto');
const { promisify } = require('util'); // build-in nodejs
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createSendToken = (user, statusCode, res, boolOrMess) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  let message;
  if (boolOrMess === false) {
    user = undefined;
  } else {
    message = boolOrMess;
  }

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1 check if email and password exist
  if (!email || !password)
    return next(new AppError('please enter your email or password', 401));
  // 2 check user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPass(password, user.password)))
    return next(new AppError('Incorrect email or password'), 401);
  // if everything oke, send token to the client

  createSendToken(user, 201, res, false);
});

exports.logout = (req, res) => {
  // tao ra jwt moi khong co gia tri tra ve client
  // sau khi nhan jwt moi thi nguoi dung khong con login
  res.cookie('jwt', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1 check token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError('You are not login, please login to get access', 401)
    );
  //2 verify token
  //Takes a function following the common error-first callback style, i.e. taking an (err, value) => ... callback as the last argument, and returns a version that returns promises. ***lay func thuong roi return ra promise***
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3 check if user still exist
  const foundUser = await User.findById(decode.id);
  if (!foundUser)
    return next(new AppError("The user with this token doesn't exist", 401));
  //4 check if user changed password after the token was issued(provide)
  if (foundUser.changedPasswordAfter(decode.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  // gán user vào req để sử dụng cho middlware sau
  req.user = foundUser;
  next();
});

// only use for view rout, no errors!
exports.isLoggedIn = async (req, res, next) => {
  try {
    //1 check token exist
    if (req.cookies.jwt) {
      //Takes a function following the common error-first callback style, i.e. taking an (err, value) => ... callback as the last argument, and returns a version that returns promises. ***lay func thuong roi return ra promise***
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3 check if user still exist
      const foundUser = await User.findById(decode.id);
      if (!foundUser) return next();
      //4 check if user changed password after the token was issued(provide)
      if (foundUser.changedPasswordAfter(decode.iat)) return next();
      // gán user vào req để sử dụng cho middlware sau
      res.locals.user = foundUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  // roles = ['admin', 'lead-guide']
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have a permission', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // check user exist
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with email address!', 404));
  // create random token
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // sent it via email's user
  const resetURL = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. if you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  // if token has not expired, and there is user, set the new password
  if (!user)
    return next(new AppError('user not exist or your token expired!', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpire = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // update changedPasswordAt property for the user
  // log the user in, send JWT
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await User.findById(req.user._id).select('+password');

  // check if POSTed current password is correct
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (!(await user.checkPass(currentPassword, user.password)))
    return next(new AppError('current password not correct', 401));

  // if so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  // log user in
  createSendToken(user, 201, res, 'password has changed!');
});
