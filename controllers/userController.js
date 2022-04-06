const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleFactory = require('./handlefactory');

// define noi luu anh va ten file
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-id-timestamp.ext
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// luu photo vao memory truoc khi crop anh
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

// chỉ cho phép update những field đc chỉ định
const filterObj = (obj, ...fieldNames) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fieldNames.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = {
  resizeUserPhoto: catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    req.file.filename = filename;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${filename}`);

    next();
  }),
  updateUserPhoto: upload.single('photo'),
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
    if (req.file) updateFields.photo = req.file.filename;
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
