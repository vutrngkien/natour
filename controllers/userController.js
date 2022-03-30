const User = require('../modals/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleFactory = require('./handlefactory');

// chỉ cho phép update những field đc chỉ định
const filterObj = (obj, ...fieldNames) => {
  console.log(fieldNames);
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fieldNames.includes(el)) newObj[el] = obj[el];
  });
  console.log(newObj);
  return newObj;
};

module.exports = {
  // dont update password
  updateUser: handleFactory.updateOne(User),
  getAllUsers: handleFactory.getAll(User),
  getMe: (req, res, next) => {
    req.params.id = req.user._id;
    next();
  },
  getUser: handleFactory.getOne(User),
  deleteUser: handleFactory.deleteOne(User),
  createNewUser: catchAsync(async (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  }),
  updateMe: catchAsync(async (req, res, next) => {
    // dont allow user update password here
    if (req.body.password || req.body.passwordConfirm)
      return next(new AppError('this rout dont update your password', 400));

    //filter fields allow to update
    const updateFields = filterObj(req.body, 'name', 'email');

    //update information user from req.body
    const userUpdate = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );
    // const user = await User.findByIdAndUpdate();
    res.status(200).json({
      status: 'success',
      message: 'update information success',
      user: userUpdate,
    });
  }),
  deleteMe: catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }),
};
