const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    // This only works on CREATE and SAVE!!! update not work
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'password confirm is not match',
    },
  },
  photo: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.checkPass = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// bcrypt password truoc khi save (thin controller, fat modals)
userSchema.pre('save', async function (next) {
  // check xem user co bi chinh sua hay khong (cu the laf password) neu co thi func dc chay k thi next
  if (!this.isModified('password')) return next();
  // auto gen salt and hash password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified() || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.createResetPasswordToken = function () {
  // random token bang ham build-in
  const resetToken = crypto.randomBytes(32).toString('hex');
  // encrypt resetToken de luu trong DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //tao han su dung cho token
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  // gui token nay qua email sau do ng dung se gui lai token va new pass
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
