const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRout = require('./reviewRout');

const Router = express.Router();

Router.use('/:tourId/reviews', reviewRout);

Router.route('/tour-within/:distance/center/:latlng/unit/:unit').get(
  tourController.tourWithin
);

Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

Router.route('/top-5-cheap').get(
  tourController.aliasTop5,
  tourController.getAllTours
);

Router.route('/tour-stats').get(tourController.getTourStats);

Router.route('/get-monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createNewTour
  );

Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.editTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
