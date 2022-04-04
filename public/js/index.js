import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapBox';

const map = document.getElementById('map');
const loginForm = document.querySelector('.form');

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
