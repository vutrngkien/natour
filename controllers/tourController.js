const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handlefactory');
// /tour-within/:distance/center/:latlng/unit/:unit

const storage = multer.memoryStorage();

// chi cho phep upload file Image
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only support upload Photo here!', 400), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = {
  uploadTourImgs: upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]),
  resizeTourImgs: catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    const imageCover = `user-${req.params.id}-${Date.now()}-cover.jpeg`;

    req.body.imageCover = imageCover;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCover}`);

    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, i) => {
        const imageName = `user-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${imageName}`);

        req.body.images.push(imageName);
      })
    );

    next();
  }),
  tourWithin: catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) next(new AppError('please provide lat and lng', 400));

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      status: 'success',
      nTours: tours.length,
      data: {
        data: tours,
      },
    });
  }),
  getDistances: catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

    if (!lat || !lng) next(new AppError('please provide lat and lng', 400));
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          spherical: true,
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        // chi dinh field muon nhan
        $project: {
          name: 1,
          distance: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  }),
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
