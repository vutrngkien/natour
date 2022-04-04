import '@babel/polyfill';
import { login } from './login';
import { logout } from './login';
import { update } from './updateSetting';
import { displayMap } from './mapBox';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form');
const formUserData = document.querySelector('.form.form-user-data');
const logOutBtn = document.querySelector('.nav__el--logout');
const passwordForm = document.querySelector('.form-user-password');

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (formUserData) {
  formUserData.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const name = document.querySelector('#name').value;
    update({ email, name }, 'data');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const savePassword = document.querySelector('.btn--password');
    const currentPassword = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password').value;
    const newPasswordConfirm =
      document.querySelector('#password-confirm').value;

    savePassword.textContent = 'Updating...';
    await update(
      { currentPassword, newPassword, newPasswordConfirm },
      'password'
    );
    savePassword.textContent = 'Save password';
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });
}
