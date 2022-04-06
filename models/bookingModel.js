const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema({
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must be long to a tour'],
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must be long to a user'],
  },
  price: {
    type: Number,
    required: [true, 'booking must have a price'],
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
