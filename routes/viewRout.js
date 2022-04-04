const express = require('express');
const authController = require('../controllers/authController');

const Router = express.Router();

const viewController = require('../controllers/viewController');

Router.get('/', authController.isLoggedIn, viewController.getOverview);
Router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewController.getTour
);
Router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
Router.get('/me', authController.protect, viewController.getAccount);

module.exports = Router;
