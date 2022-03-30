const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../modals/tourModal');
const User = require('../modals/userModal');
const Review = require('../modals/reviewModal');

mongoose.connect('mongodb://localhost:27017/natours');

const tour = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'));
const user = JSON.parse(fs.readFileSync('./dev-data/data/users.json', 'utf-8'));
const review = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);

const seeding = async () => {
  await Tour.create(tour);
  await User.create(user, { validateBeforeSave: false });
  await Review.create(review);
  console.log('seeding successfully!');
  mongoose.connection.close();
};

const deleteAll = async () => {
  await Tour.deleteMany({});
  await User.deleteMany({});
  await Review.deleteMany({});
  console.log('db is empty!');
  mongoose.connection.close();
};

if (process.argv[2] === '--seed') {
  seeding();
} else if (process.argv[2] === '--delete') {
  deleteAll();
}
