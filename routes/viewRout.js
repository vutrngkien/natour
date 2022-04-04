const express = require('express');
const authController = require('../controllers/authController');

const Router = express.Router();

const viewController = require('../controllers/viewController');

Router.use(authController.isLoggedIn);

Router.get('/', viewController.getOverview);
Router.get('/tour/:tourSlug', viewController.getTour);
Router.get('/login', viewController.getLoginForm);

module.exports = Router;
