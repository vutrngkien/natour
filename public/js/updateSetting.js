/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const update = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updatePassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    // thuc hien tao req den sever
    const res = await axios({
      method: 'patch',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', err.response.data.message);
  }
};
