/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    // thuc hien tao req den sever
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    // thuc hien tao req den sever
    const res = await axios({
      method: 'get',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'logging out successfully!');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

exports.signup = async (name, email, password, passwordConfirm) => {
  try {
    if (password !== passwordConfirm) {
      showAlert('error', 'Your password dont match!, try again!');
    } else {
      // thuc hien tao req den sever
      const res = await axios({
        method: 'post',
        url: '/api/v1/users/signup',
        data: {
          name,
          email,
          password,
          passwordConfirm,
        },
      });
      if (res.data.status === 'success') {
        showAlert('success', 'Sign up successfully!');
        location.assign('/');
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
