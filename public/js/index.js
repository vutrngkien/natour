import '@babel/polyfill';
import { login } from './login';
import { logout } from './login';
import { signup } from './login';
import { update } from './updateSetting';
import { displayMap } from './mapBox';
import { bookTour } from './stripe';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const formUserData = document.querySelector('.form.form-user-data');
const logOutBtn = document.querySelector('.nav__el--logout');
const passwordForm = document.querySelector('.form.form-user-password');
const bookBtn = document.querySelector('#book-tour');
const formSignUp = document.querySelector('.form-sign-up');

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
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.querySelector('#photo').files[0]);
    update(form, 'data');
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

if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    await bookTour(tourId);
    // e.target.textContent = 'Processing...';
  });
}

if (formSignUp) {
  formSignUp.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const name = document.querySelector('#name').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;

    e.target.lastChild.style.display = 'none';
    const text = document.createElement('h1');
    text.textContent = 'Processing...';
    e.target.appendChild(text);
    await signup(name, email, password, passwordConfirm);
  });
}
