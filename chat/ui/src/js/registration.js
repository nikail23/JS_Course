/* eslint-disable no-undef */
class User {
  constructor(name, avatar) {
    this.name = name;
    this.avatar = avatar;
  }
}

let users = [];

function loadUsers() {
  const usersStorageString = localStorage.getItem('users');
  if (usersStorageString) {
    users = JSON.parse(usersStorageString);
  }
}

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

const registerButton = document.getElementById('register');
registerButton.addEventListener('click', () => {
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const repeatPasswordInput = document.getElementById('repeatPassword');

  const login = loginInput.value;
  const password = passwordInput.value;
  const repeatPassword = repeatPasswordInput.value;

  if (!login || login.length < 4) {
    loginInput.value = '';
    loginInput.placeholder = 'Size of login < 4!';
    return;
  }

  const checkLogin = new RegExp('[a-zA-Z0-9]+');
  if (login.match(checkLogin) === null) {
    loginInput.value = '';
    loginInput.placeholder = 'Login must consist of a-z, A-Z, 0-9.';
    return;
  }

  function checkUserInUsers(userLogin) {
    let isFind = false;
    users.forEach((user) => {
      if (user.name === userLogin) {
        isFind = true;
      }
    });
    return isFind;
  }

  if (checkUserInUsers(login)) {
    loginInput.value = '';
    loginInput.placeholder = 'User with same login detected.';
    return;
  }

  if (!password || password.length < 6) {
    passwordInput.value = '';
    passwordInput.placeholder = 'Size of password < 6!';
    return;
  }

  const checkPassword = new RegExp('[a-zA-Z0-9]+');
  if (password.match(checkPassword) === null) {
    passwordInput.value = '';
    passwordInput.placeholder = 'Password must consist of a-z, A-Z, 0-9.';
    return;
  }

  if (!repeatPassword) {
    repeatPasswordInput.value = '';
    repeatPasswordInput.placeholder = 'This field must not be empty.';
    return;
  }

  if (password !== repeatPassword) {
    repeatPasswordInput.value = '';
    repeatPasswordInput.placeholder = 'Not equals password.';
    return;
  }

  const newUser = new User(login, 'https://image.flaticon.com/icons/png/512/194/194938.png');
  users.push(newUser);
  saveUsers();
  document.location.href = '../login.html';
});

loadUsers();
