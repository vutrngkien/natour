const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(doc);
    if (!doc)
      return next(
        new AppError('Document dont exist, please try it again!', 400)
      );
    res.status(200).json({
      status: 'delete success',
      data: null,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return next(
        new AppError('Document dont exist, please try it again!', 400)
      );
    res.status(200).json({
      status: 'edit success',
      data: {
        doc,
      },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc)
      return next(
        new AppError('Document dont exist, please try it again!', 400)
      );
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.getOne = (Model, populateOpts) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOpts) query = query.populate(populateOpts);

    const doc = await query;

    if (!doc) {
      return next(new AppError('doc id not exist', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.getAll = (Model) => {
  // cung cap cap tinh nang sort, select, pagination, loc cac doc co lien quan
  return catchAsync(async (req, res) => {
    // get tat ca review hoac lay review cua 1 tua theo tourId
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .fields()
      .sort()
      .pagination();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
  });
};
