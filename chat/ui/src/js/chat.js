/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
class ChatApiService {
  constructor(address) {
    this._address = address;
    this._token = sessionStorage.getItem('token');

    this._messages = [];

    this._users = [];
    this._activeUsers = [];
    this._currentUser = null;
  }

  setCurrentUser(user) {
    this._currentUser = user;
  }

  getCurrentUser() {
    return this._currentUser;
  }

  async getMessages(skip, top, filter) {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', this._token);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    let request = `${this._address}/messages?`;
    let isFirst = false;

    if (skip !== undefined) {
      request += `skip=${skip}`;
      isFirst = true;
    }

    if (top !== undefined) {
      if (isFirst) {
        request += `&top=${top}`;
      } else {
        isFirst = true;
        request += `top=${top}`;
      }
    }

    if (filter !== undefined && filter !== null) {
      if (filter.dateTo !== undefined) {
        if (isFirst) {
          request += `&dateTo=${filter.dateTo}`;
        } else {
          isFirst = true;
          request += `dateTo=${filter.dateTo}`;
        }
      }
      if (filter.dateFrom !== undefined) {
        if (isFirst) {
          request += `&dateFrom=${filter.dateFrom}`;
        } else {
          isFirst = true;
          request += `dateFrom=${filter.dateFrom}`;
        }
      }
      if (filter.author !== undefined) {
        if (isFirst) {
          request += `&author=${filter.author}`;
        } else {
          isFirst = true;
          request += `author=${filter.author}`;
        }
      }
      if (filter.text !== undefined) {
        if (isFirst) {
          request += `&text=${filter.text}`;
        } else {
          isFirst = true;
          request += `text=${filter.text}`;
        }
      }
    }

    const response = await fetch(request, requestOptions);
    const messages = await response.json();

    return messages;
  }

  async addMessage(text, isPersonal, to) {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', this._token);

    const raw = `{\n    "text": "${text}",\n    "isPersonal": ${isPersonal},\n    "to": "${to}"\n}`;

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    let messageId = null;

    fetch(`${this._address}/message`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (result.indexOf('id') !== -1) {
          messageId = result.substring(7, result.length - 1);
        }
      })
      .catch((error) => console.log('error', error));

    return messageId;
  }

  editMessage(id, text, isPersonal, to) {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer some.token');

    const raw = `{\n    "text": "${text}",\n    "isPersonal": ${isPersonal},\n    "to": "${to}"\n}`;

    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    let status = null;

    fetch(`${address}/message/${id}`, requestOptions)
      .then((response) => {
        if (response.status === 200) {
          console.log('Succesfully edit!');
          status = true;
        } else {
          status = false;
          document.location.href = `../error.html?errorCode=${response.status}&errorDescription=${response.statusText}`;
        }
      })
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error));

    return status;
  }

  deleteMesssage(id) {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', this._token);

    const requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
    };

    let status = null;

    fetch(`${address}/message/${id}`, requestOptions)
      .then((response) => {
        if (response.status === 200) {
          status = true;
          console.log('Successfully delete!');
        } else {
          status = false;
          document.location.href = `../error.html?errorCode=${response.status}&errorDescription=${response.statusText}`;
        }
      })
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error));

    return status;
  }

  logOut() {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', this._token);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
    };

    fetch('/logout', requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error));
  }

  async getUsers() {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', this._token);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const response = await fetch(`${this._address}/users`, requestOptions);
    const users = await response.json();

    return users;
  }
}

class Message {
  constructor(id, text, createdAt, author, isPersonal, to) {
    this.id = id;
    this.text = text;
    this.createdAt = createdAt;
    this.author = author;
    this.isPersonal = isPersonal;
    this.to = to;
  }
}

class FilterConfig {
  constructor(author, dateFrom, dateTo, text) {
    this.author = author;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.text = text;
  }
}

class MessagesView {
  constructor(containerId) {
    this.containerId = containerId;
  }

  display(messages, currentUser) {
    // eslint-disable-next-line no-undef
    const container = document.getElementById(this.containerId);
    let messagesHTML = '';
    messages.forEach((message) => {
      const formatDate = `${(`0${message.createdAt.getDate()}`).slice(-2)}/${(`0${message.createdAt.getMonth() + 1}`).slice(-2)}/${message.createdAt.getFullYear()} ${(`0${message.createdAt.getHours()}`).slice(-2)}:${(`0${message.createdAt.getMinutes()}`).slice(-2)}:${(`0${message.createdAt.getSeconds()}`).slice(-2)}`;
      const infoString = `${message.isPersonal ? `Personal message to ${message.to}` : 'Common message'} from ${message.author},<br/> at ${formatDate}`;
      if (message.author === currentUser.name) {
        messagesHTML
          += `<div class="commonSentMessage" id="${message.id}">
          <input type="text" disabled value="${message.text}">
          <img class="imgMes1 delete" src="https://icon-library.com/images/deleted-icon/deleted-icon-18.jpg"/>
          <img class="imgMes1 edit" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/OOjs_UI_icon_edit-ltr-progressive.svg/1024px-OOjs_UI_icon_edit-ltr-progressive.svg.png"/>
        </div>  
        <div class="info info2">${infoString}</div> `;
      } else {
        messagesHTML
          += `<div class="commonComeMessage" id="${message.id}">
          <input type="text" disabled value="${message.text}">
          </div>  
        <div class="info info1">${infoString}</div>`;
      }
    });
    container.innerHTML = messagesHTML;
  }
}

class User {
  constructor(name, avatar) {
    this.name = name;
    this.avatar = avatar;
  }
}

class ActiveUsersView {
  constructor(containerId) {
    this.containerId = containerId;
  }

  display(users, activeUser) {
    // eslint-disable-next-line no-undef
    const container = document.getElementById(this.containerId);
    let html = '';
    users.forEach((user) => {
      if (user.name !== activeUser.name) {
        html += `<div class="user">
        <img src="${user.avatar}" alt="">
        <span>${user.name}</span>
        </div>`;
      }
    });
    container.innerHTML = html;
  }
}

class HeaderView {
  constructor(avatarId, currentUserNameId) {
    this.avatarId = avatarId;
    this.currentUserNameId = currentUserNameId;
  }

  display(avatar, name) {
    // eslint-disable-next-line no-undef
    const avatarContainer = document.getElementById(this.avatarId);
    avatarContainer.innerHTML = `<img src='${avatar}' alt='avatar'> </img>`;
    // eslint-disable-next-line no-undef
    const nameContaner = document.getElementById(this.currentUserNameId);
    nameContaner.innerHTML = name;
  }
}

class HelpBoxView {
  constructor(helpBoxId) {
    this.helpBoxId = helpBoxId;
  }

  display(to) {
    // eslint-disable-next-line no-undef
    const helpBox = document.getElementById(this.helpBoxId);
    helpBox.innerHTML = `[to: ${to}]`;
  }
}

class FiltersView {
  constructor(filtersBoxId) {
    this.filtersBoxId = filtersBoxId;
  }

  display(filterConfig) {
    const filtersBox = document.getElementById(this.filtersBoxId);
    const authorFilterBox = filtersBox.children[0];
    const dateFromFilterBox = filtersBox.children[1];
    const dateToFilterBox = filtersBox.children[2];
    const textFilterBox = filtersBox.children[3];

    if (filterConfig.author) {
      authorFilterBox.value = filterConfig.author;
    }

    if (filterConfig.dateFrom) {
      dateFromFilterBox.value = filterConfig.dateFrom;
    }

    if (filterConfig.dateTo) {
      dateToFilterBox.value = filterConfig.dateTo;
    }

    if (filterConfig.text) {
      textFilterBox.value = filterConfig.text;
    }
  }
}

// CONTROLLER

const chatApi = new ChatApiService('https://jslabdb.datamola.com');

class ChatController {
  constructor() {
    this.currentTop = 10;
    this.currentSkip = 0;
    this.currentFilter = null;
    this.currentSelectedUser = 'All';

    this.messagesView = new MessagesView('messages');
    this.activeUsersView = new ActiveUsersView('usersList');
    this.helpBoxView = new HelpBoxView('mymessage');
    this.filtersView = new FiltersView('filters');
    this.headerView = new HeaderView('avatar', 'currentUser');

    this.showHelpBox(this.currentSelectedUser);
    this.showActiveUsers();
    this.showMessages(this.currentSkip, this.currentTop, this.currentFilter);
    this.loadCurrentUser();
  }

  async addMessage(text, isPersonal, to) {
    const messageId = await chatApi.addMessage(text, isPersonal, to);
    if (messageId != null) {
      console.log(messageId);
      this.showMessages();
    }
  }

  async editMessage(id, text, isPersonal, to) {
    if (chatApi.editMessage(id, text, isPersonal, to)) {
      this.showMessages();
    }
  }

  async removeMessage(id) {
    if (chatApi.deleteMesssage(id)) {
      this.showMessages();
    }
  }

  _getValidMessages(messages) {
    messages.forEach((message) => {
      message.createdAt = new Date(message.createdAt);
    });
  }

  async showMessages() {
    const messages = await chatApi.getMessages(this.currentSkip, this.currentTop, this.currentFilter);
    this._getValidMessages(messages);
    if (messages !== null) {
      this.messagesView.display(messages, chatApi.getCurrentUser());
    }
  }

  _sortActiveUsers(users) {
    const activeUsers = [];
    users.forEach((user) => {
      if (user.isActive) {
        activeUsers.push(new User(user.name, 'https://whatsism.com/uploads/posts/2018-07/1530546770_rmk_vdjbx10.jpg'));
      }
    });
    return activeUsers;
  }

  async showActiveUsers() {
    const users = await chatApi.getUsers();
    if (users !== null) {
      this.activeUsersView.display(this._sortActiveUsers(users), chatApi.getCurrentUser());
    }
  }

  setCurrentUser(name, avatar) {
    chatApi.setCurrentUser(new User(name, avatar));
    this.headerView.display(chatApi.getCurrentUser().avatar, chatApi.getCurrentUser().name);
  }

  showHelpBox(to) {
    this.helpBoxView.display(to);
  }

  showFilters(filterConfig) {
    this.filtersView.display(filterConfig);
  }

  loadCurrentUser() {
    const currentUserStorageText = sessionStorage.getItem('currentUser');
    if (currentUserStorageText) {
      const currentUser = JSON.parse(currentUserStorageText);
      this.setCurrentUser(currentUser.name, currentUser.avatar);
    } else {
      document.location.href = '../error.html?errorCode=405&errorDescription=Unathorised';
    }
  }
}

const chatController = new ChatController();

function addSelectUserEvent() {
  const activeUsers = document.getElementsByClassName('user');
  Array.prototype.slice.call(activeUsers).forEach((user) => {
    user.addEventListener('click', (event) => {
      const oldSelectedUser = chatController.currentSelectedUser;
      chatController.currentSelectedUser = user.children[1].innerText;
      if (oldSelectedUser === chatController.currentSelectedUser) {
        chatController.currentSelectedUser = 'All';
      }
      const helpContainer = document.getElementById('mymessage');
      chatController.showHelpBox(chatController.currentSelectedUser);
    });
  });
}

function addLoadOtherMessagesButtonEvent() {
  const loadOtherMessagesButton = document.getElementById('loadmore');
  loadOtherMessagesButton.addEventListener('click', (event) => {
    if (chatController.currentTop < chatController.messageList.getMessagesLength()) {
      chatController.currentTop += 10;
    }
    chatController.showMessages(chatController.currentSkip, chatController.currentTop, chatController.currentFilter);
  });
}

function addDeleteEventToAllMessages() {
  const deleteMessageButtons = document.getElementsByClassName('delete');
  Array.prototype.slice.call(deleteMessageButtons).forEach((button) => {
    button.addEventListener('click', (event) => {
      const messageContainer = button.parentNode;
      chatController.removeMessage(messageContainer.id);
      // eslint-disable-next-line no-use-before-define
      addEditEventToAllMessages();
      addDeleteEventToAllMessages();
    });
  });
}

function addEditEventToAllMessages() {
  const editMessageButtons = document.getElementsByClassName('edit');
  Array.prototype.slice.call(editMessageButtons).forEach((button) => {
    button.addEventListener('click', (event) => {
      const messageContainer = button.parentNode;
      const messageInput = messageContainer.children[0];
      const messageText = messageInput.value;

      const editButton = messageContainer.children[1];
      const deleteButton = messageContainer.children[2];

      messageContainer.removeChild(editButton);
      messageContainer.removeChild(deleteButton);
      messageInput.removeAttribute('disabled');

      messageInput.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
          case 13:
            chatController.editMessage(messageContainer.id, messageInput.value);
            addDeleteEventToAllMessages();
            addEditEventToAllMessages();
            messageContainer.appendChild(deleteButton);
            messageContainer.appendChild(editButton);
            messageInput.setAttribute('disabled', true);
            break;
          case 27:
            messageInput.value = messageText;
            messageContainer.appendChild(deleteButton);
            messageContainer.appendChild(editButton);
            messageInput.setAttribute('disabled', true);
            break;
          default:
            break;
        }
      });
    });
  });
}

function addFilterEvent() {
  const filterSendButton = document.getElementById('filterSendButton');
  const filterCancelButton = document.getElementById('filterCancelButton');

  filterSendButton.addEventListener('click', (event) => {
    const filtersBox = document.getElementById('filters');
    const authorFilterBox = filtersBox.children[0];
    const dateFromFilterBox = filtersBox.children[1];
    const dateToFilterBox = filtersBox.children[2];
    const textFilterBox = filtersBox.children[3];

    const authorFilter = authorFilterBox.value;
    const dateFromFilterText = dateFromFilterBox.value;
    const dateToFilterText = dateToFilterBox.value;
    let dateFromFilter;
    let dateToFilter;

    if (dateFromFilterText !== '') {
      dateFromFilter = new Date(dateFromFilterText);
      dateFromFilter.setHours(0);
      dateFromFilter.setMinutes(0);
      dateFromFilter.setSeconds(0);
    }

    if (dateToFilterText !== '') {
      dateToFilter = new Date(dateToFilterText);
      dateToFilter.setHours(23);
      dateToFilter.setMinutes(59);
      dateToFilter.setSeconds(59);
    }

    const textFilter = textFilterBox.value;

    const filter = new FilterConfig(authorFilter, dateFromFilter, dateToFilter, textFilter);
    chatController.showMessages(this.currentSkip, this.currentTop, filter);
  });

  filterCancelButton.addEventListener('click', (event) => {
    const filtersBox = document.getElementById('filters');
    filtersBox.children[0].value = null;
    filtersBox.children[1].value = null;
    filtersBox.children[2].value = null;
    filtersBox.children[3].value = null;

    chatController.currentFilter = null;
    chatController.showMessages(chatController.currentSkip, chatController.currentTop, chatController.currentFilter);
  });
}

function addSendButtonEvent() {
  const messageInput = document.getElementById('sendButton');
  messageInput.addEventListener('click', (event) => {
    event.preventDefault();
    const textInput = document.getElementById('myInput');
    const messageText = textInput.value;
    if (messageText.length === 0) {
      return;
    }
    if (chatController.currentSelectedUser !== 'All') {
      chatController.addMessage(messageText, true, currentSelectedUser);
    } else {
      chatController.addMessage(messageText, false);
    }

    addEditEventToAllMessages();
    addDeleteEventToAllMessages();
    textInput.value = '';
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTo(0, document.body.scrollHeight);
  });
}

function addLogOutEvent() {
  const logOutButton = document.getElementById('logOut');
  logOutButton.addEventListener('click', () => {
    chatApi.logOut();
    document.location.href('../login.html');
  });
}

addLogOutEvent();
addFilterEvent();
addSelectUserEvent();
addLoadOtherMessagesButtonEvent();
addSendButtonEvent();
addDeleteEventToAllMessages();
addEditEventToAllMessages();
