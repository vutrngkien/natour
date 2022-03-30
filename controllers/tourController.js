const Tour = require('../modals/tourModal');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handlefactory');

module.exports = {
  getMonthlyPlan: catchAsync(async (req, res) => {
    const { year } = req.params;
    const monthly = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTours: -1 } },
    ]);

    res.status(200).json({
      status: 'success',
      result: monthly.length,
      data: {
        tours: monthly,
      },
    });
  }),
  getTourStats: catchAsync(async (req, res) => {
    // mongodb aggregation pipeline nhan vao array cac stage
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          avgRating: { $avg: '$ratingsAverage' },
          RatingQuantity: { $sum: '$ratingsQuantity' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      // {
      //   $match: { _id: { $ne: 'easy' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      result: stats.length,
      data: {
        stats,
      },
    });
  }),
  aliasTop5: catchAsync(async (req, res, next) => {
    const top5 = {
      limit: '5',
      sort: '-ratingsAverage,price',
      fields: 'name, price, ratingsAverage',
    };
    req.query = { ...req.query, ...top5 };
    next();
  }),
  getAllTours: handleFactory.getAll(Tour),
  getTour: handleFactory.getOne(Tour, { path: 'reviews' }),
  createNewTour: handleFactory.createOne(Tour),
  editTour: handleFactory.updateOne(Tour),
  deleteTour: handleFactory.deleteOne(Tour),
};
