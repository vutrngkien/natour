const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handlefactory');

exports.getAllReview = handleFactory.getAll(Review);
exports.getReview = handleFactory.getOne(Review);
exports.createReview = handleFactory.createOne(Review);
exports.updateReview = handleFactory.updateOne(Review);
exports.deleteReview = handleFactory.deleteOne(Review);
exports.setTourUserIds = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
