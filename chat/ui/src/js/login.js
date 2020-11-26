/* eslint-disable no-else-return */
/* eslint-disable no-undef */
class User {
  constructor(name, avatar) {
    this.name = name;
    this.avatar = avatar;
  }
}

let users = [];
let activeUsers = [];

function loadUsers() {
  const usersStorageString = localStorage.getItem('users');
  if (usersStorageString) {
    users = JSON.parse(usersStorageString);
  }
}

function loadActiveUsers() {
  const activeUsersStorageString = localStorage.getItem('activeUsers');
  if (activeUsersStorageString) {
    activeUsers = JSON.parse(activeUsersStorageString);
  }
}

function saveActiveAndCurrentUsers(currentUser) {
  localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function checkUserInActiveUsers(userLogin) {
  let isFind = false;
  activeUsers.forEach((user) => {
    if (user.name === userLogin) {
      isFind = true;
    }
  });
  return isFind;
}

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', () => {
  const loginInput = document.getElementById('login');
  // const passwordInput = document.getElementById('password');

  const login = loginInput.value;
  // const password = passwordInput.value;

  function getUser(userLogin) {
    let findUser = null;
    users.forEach((user) => {
      if (user.name === userLogin) {
        findUser = user;
      }
    });
    return findUser;
  }

  const logInUser = getUser(login);
  if (logInUser === null) {
    loginInput.value = '';
    loginInput.placeholder = 'User with same login not founded.';
    return;
  }

  if (!checkUserInActiveUsers(logInUser.name)) {
    activeUsers.push(logInUser);
  }
  saveActiveAndCurrentUsers(logInUser);

  document.location.href = '../main.html';
});

loadUsers();
loadActiveUsers();
