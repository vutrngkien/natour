const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All tour', tours });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    select: 'rating review user',
  });

  if (!tour) return next(new AppError('Tour name not exist!', 404));

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', { title: tour.name, tour });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', { title: 'Log In' });
};

exports.getSignUpForm = (req, res, next) => {
  res.status(200).render('signup', { title: 'Sign Up' });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'My profile',
  });
};

exports.getMyTour = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const toursId = bookings.map((el) => {
    return el.tour;
  });

  const tours = await Tour.find({ _id: { $in: toursId } });
  res.status(200).render('overview', {
    tours,
  });
});
