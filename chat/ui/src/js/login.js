/* eslint-disable no-else-return */
/* eslint-disable no-undef */

class User {
  constructor(name, avatar) {
    this.name = name;
    this.avatar = avatar;
  }
}

class ChatApiService {
  constructor(address) {
    this.address = address;
  }

  sendLoginRequest(login, password) {
    const formdata = new FormData();
    formdata.append('name', login);
    formdata.append('pass', password);

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    fetch(`${this.address}/auth/login`, requestOptions)
      .then((response) => response.text())
      .then((result) => this.handleLoginResponse(result, login))
      .catch((error) => console.log('error', error));
  }

  handleLoginResponse(result, login) {
    if (result.indexOf('token') !== -1) {
      sessionStorage.setItem('token', result.substring(10, result.length - 2));
      sessionStorage.setItem('currentUser', JSON.stringify(new User(login, 'https://image.flaticon.com/icons/png/512/194/194938.png')));
      document.location.href = '../main.html';
    } else {
      // ошибка, выводим пользователю на экран
    }
  }
}

const chatApi = new ChatApiService('https://jslabdb.datamola.com');

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', () => {
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');

  const login = loginInput.value;
  const password = passwordInput.value;

  chatApi.sendLoginRequest(login, password);
});
