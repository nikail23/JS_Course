/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
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

class MessageList {
  constructor() {
    this._restore();
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  _save() {
    localStorage.setItem('messages', JSON.stringify(this._messages));
  }

  _restore() {
    this._messages = JSON.parse(localStorage.getItem('messages'));
    this._messages.forEach((message) => {
      message.createdAt = new Date(message.createdAt);
    });
  }

  getMessagesLength() {
    return this._messages.length;
  }

  getPage(skip, top, filterConfig) {
    let messagesBuffer = this._messages.slice();

    if (!skip) skip = 0;
    if (!top) top = 10;

    if (filterConfig) {
      if (filterConfig.author) {
        for (let i = 0; i < messagesBuffer.length; i++) {
          if (messagesBuffer[i].author.indexOf(filterConfig.author) === -1) {
            messagesBuffer.splice(i, 1);
            i--;
          }
        }
      }

      if (filterConfig.dateFrom) {
        for (let i = 0; i < messagesBuffer.length; i++) {
          if (messagesBuffer[i].createdAt < filterConfig.dateFrom) {
            messagesBuffer.splice(i, 1);
            i--;
          }
        }
      }

      if (filterConfig.dateTo) {
        for (let i = 0; i < messagesBuffer.length; i++) {
          if (messagesBuffer[i].createdAt > filterConfig.dateTo) {
            messagesBuffer.splice(i, 1);
            i--;
          }
        }
      }

      if (filterConfig.text) {
        for (let i = 0; i < messagesBuffer.length; i++) {
          if (messagesBuffer[i].text.indexOf(filterConfig.text) === -1) {
            messagesBuffer.splice(i, 1);
            i--;
          }
        }
      }
    }

    function compareDates(message1, message2) {
      return message1.createdAt - message2.createdAt;
    }
    messagesBuffer.sort(compareDates);

    if (this.user) {
      for (let i = 0; i < messagesBuffer.length; i++) {
        if (messagesBuffer[i].isPersonal && messagesBuffer[i].to !== this.user && messagesBuffer[i].author !== this.user) {
          messagesBuffer.splice(i, 1);
          i--;
        }
      }
    }

    let startIndex = messagesBuffer.length - top - skip;
    if (startIndex < 0) {
      startIndex = 0;
    }

    let endIndex = messagesBuffer.length - skip;
    if (endIndex < 0) {
      endIndex = 0;
    }

    messagesBuffer = messagesBuffer.slice(startIndex, endIndex);

    return messagesBuffer;
  }

  get(id) {
    function checkId(element) {
      if (element.id === id) {
        return true;
      }
      return false;
    }
    return this._messages.find(checkId);
  }

  static validate(message) {
    if (!(typeof (message.id) === 'string')
      || !(typeof (message.author) === 'string')
      || !(typeof (message.text) === 'string')
      || !(message.createdAt instanceof Date)
      || (message.isPersonal && !(typeof (message.isPersonal) === 'boolean'))
      || (message.to && !(typeof (message.to) === 'string'))) {
      return false;
    }
    return true;
  }

  add(message) {
    if (message.author === undefined) {
      message.author = this.user;
    }
    if (message.id === undefined) {
      message.id = String(Number(this._messages[this._messages.length - 1].id) + 1);
    }
    if (message.createdAt === undefined) {
      message.createdAt = new Date();
    }
    if (MessageList.validate(message)) {
      const newMessage = new Message(
        message.id,
        message.text,
        message.createdAt,
        message.author,
        message.isPersonal,
        message.to,
      );
      this._messages.push(newMessage);
      this._save();
      return true;
    }
    return false;
  }

  addAll(messages) {
    const unvalidatedMessages = [];
    messages.forEach((message) => {
      if (!this.add(message)) {
        unvalidatedMessages.push(message);
      }
    });
    this._save();
    return unvalidatedMessages;
  }

  remove(id) {
    const message = this.get(id);
    if (message) {
      const index = this._messages.indexOf(message);
      if (this.user) {
        if (message.author === this.user) {
          this._messages.splice(index, 1);
          this._save();
          return true;
        }
        return false;
      }
      this._messages.splice(index, 1);
      this._save();
      return true;
    }
    return false;
  }

  edit(id, editedMessage) {
    function copy(sourceMessage, newMessage) {
      sourceMessage.id = newMessage.id;
      sourceMessage.author = newMessage.author;
      sourceMessage.text = newMessage.text;
      if (newMessage.isPersonal) {
        sourceMessage.isPersonal = newMessage.isPersonal;
      }
      if (newMessage.to) {
        sourceMessage.to = newMessage.to;
      }
      sourceMessage.createdAt = newMessage.createdAt;
    }
    if (editedMessage.author === undefined) {
      editedMessage.author = this.user;
    }
    if (editedMessage.id === undefined) {
      editedMessage.id = String(Number(this._messages[this._messages.length - 1].id) + 1);
    }
    if (editedMessage.createdAt === undefined) {
      editedMessage.createdAt = new Date();
    }
    if (MessageList.validate(editedMessage)) {
      const editableMessage = this.get(id);
      if (editableMessage) {
        if (this.user) {
          if (editableMessage.author === this.user) {
            copy(editableMessage, editedMessage);
            this._save();
            return true;
          }
          return false;
        }
        copy(editableMessage, editedMessage);
        this._save();
        return true;
      }
      return false;
    }
    return false;
  }

  clear() {
    this._messages = [];
    this._save();
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

class UserList {
  constructor() {
    this._restore();
  }

  _save() {
    localStorage.setItem('users', JSON.stringify(this._users));
    localStorage.setItem('activeUsers', JSON.stringify(this._activeUsers));
    localStorage.setItem('currentUser', JSON.stringify(this._currentUser));
  }

  _restore() {
    this._users = JSON.parse(localStorage.getItem('users'));
    this._activeUsers = JSON.parse(localStorage.getItem('activeUsers'));
    this._currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  setCurrentUser(name) {
    const activeUserIndex = this.getActiveUserIndex(name);
    if (activeUserIndex !== -1) {
      this._currentUser = this._activeUsers[activeUserIndex];
    }
    this._save();
  }

  getCurrentUser() {
    return this._currentUser;
  }

  addUser(name, avatar) {
    if (this.getUserIndex(name) === -1) {
      this._users.push(new User(name, avatar));
    }
    this._save();
  }

  setActiveUser(name) {
    const userIndex = this.getUserIndex(name);
    const activeUserIndex = this.getActiveUserIndex(name);
    if (userIndex !== -1 && activeUserIndex === -1) {
      this._activeUsers.push(this._users[userIndex]);
    }
    this._save();
  }

  setPassiveUser(name) {
    const activeUserIndex = this.getActiveUserIndex(name);
    if (activeUserIndex !== -1) {
      this._activeUsers.splice(activeUserIndex, 1);
    }
    this._save();
  }

  deleteUser(name) {
    const index = this.getUserIndex(name);
    if (index !== -1) {
      this._users.splice(index, 1);
    }
    this._save();
  }

  getUserIndex(name) {
    if (!this._users) {
      return -1;
    }
    for (let i = 0; i < this._users.length; i++) {
      if (name === this._users[i].name) {
        return i;
      }
    }
    return -1;
  }

  getActiveUserIndex(name) {
    if (!this._activeUsers) {
      return -1;
    }
    for (let i = 0; i < this._activeUsers.length; i++) {
      if (name === this._activeUsers[i].name) {
        return i;
      }
    }
    return -1;
  }

  getAllUsers() {
    return this._users;
  }

  getAllActiveUsers() {
    return this._activeUsers;
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

function checkLocalStorage() {
  const readyUsers = [
    new User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
    new User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
    new User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
    new User('User4', 'https://cdn.iconscout.com/icon/free/png-256/avatar-372-456324.png'),
  ];
  const readyActiveUsers = [
    new User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
    new User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
    new User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
  ];
  const readyCurrentUser = readyActiveUsers[0];
  const readyMessages = [
    new Message(
      '0',
      'Hello User1!',
      new Date(),
      'User2',
      false,
    ),

    new Message(
      '1',
      'Hello!',
      new Date(),
      'User1',
      false,
    ),

    new Message(
      '2',
      'Hello User2!',
      new Date(),
      'User1',
      true,
      'User2',
    ),

    new Message(
      '3',
      '...',
      new Date(),
      'User3',
      false,
    ),
  ];

  if (localStorage.getItem('users') === null) {
    localStorage.setItem('users', JSON.stringify(readyUsers));
  }

  if (localStorage.getItem('activeUsers') === null) {
    localStorage.setItem('activeUsers', JSON.stringify(readyActiveUsers));
  }

  if (localStorage.getItem('currentUser') === null) {
    localStorage.setItem('currentUser', JSON.stringify(readyCurrentUser));
  }

  if (localStorage.getItem('messages') === null) {
    localStorage.setItem('messages', JSON.stringify(readyMessages));
  }
}

checkLocalStorage();

const messageList = new MessageList();
const messagesView = new MessagesView('messages');

const userList = new UserList();
const activeUsersView = new ActiveUsersView('usersList');

const helpBoxView = new HelpBoxView('mymessage');
const filtersView = new FiltersView('filters');

function addMessage(text, isPersonal, to) {
  if (messageList.add(new Message(undefined, text, undefined, undefined, isPersonal, to))) {
    this.showMessages();
  }
}

function editMessage(id, text, isPersonal, to) {
  if (messageList.edit(id, new Message(undefined, text, undefined, undefined, isPersonal, to))) {
    this.showMessages();
  }
}

function removeMessage(id) {
  if (messageList.remove(id)) {
    this.showMessages();
  }
}

function showMessages(skip, top, filter) {
  if (filter) {
    // eslint-disable-next-line no-use-before-define
    currentFilter = filter;
  }
  messagesView.display(messageList.getPage(skip, top, filter), userList.getCurrentUser());
}

function showActiveUsers() {
  activeUsersView.display(userList.getAllActiveUsers(), userList.getCurrentUser());
}

function setCurrentUser(name, avatar) {
  userList.addUser(name, avatar);
  userList.setActiveUser(name);
  userList.setCurrentUser(name);
  messageList.user = name;

  const headerView = new HeaderView('avatar', 'currentUser');
  headerView.display(userList.getCurrentUser().avatar, userList.getCurrentUser().name);
  this.showMessages();
  this.showActiveUsers();
}

function showHelpBox(to) {
  helpBoxView.display(to);
}

function showFilters(filterConfig) {
  filtersView.display(filterConfig);
}

function loadCurrentUser() {
  const currentUserStorageText = localStorage.getItem('currentUser');
  if (currentUserStorageText) {
    const currentUser = JSON.parse(currentUserStorageText);
    setCurrentUser(currentUser.name, currentUser.avatar);
  } else {
    setCurrentUser(activeUsers[0].name, activeUsers[0].avatar);
  }
}

// CONTROLLER

let currentTop = 10;
const currentSkip = 0;
let currentFilter = null;
let currentSelectedUser = 'All';

showHelpBox(currentSelectedUser);
showActiveUsers();
showMessages(currentSkip, currentTop, currentFilter);
loadCurrentUser();

function addSelectUserEvent() {
  const activeUsers = document.getElementsByClassName('user');
  Array.prototype.slice.call(activeUsers).forEach((user) => {
    user.addEventListener('click', (event) => {
      const oldSelectedUser = currentSelectedUser;
      currentSelectedUser = user.children[1].innerText;
      if (oldSelectedUser === currentSelectedUser) {
        currentSelectedUser = 'All';
      }
      const helpContainer = document.getElementById('mymessage');
      showHelpBox(currentSelectedUser);
    });
  });
}

function addLoadOtherMessagesButtonEvent() {
  const loadOtherMessagesButton = document.getElementById('loadmore');
  loadOtherMessagesButton.addEventListener('click', (event) => {
    if (currentTop < messageList.getMessagesLength()) {
      currentTop += 10;
    }
    showMessages(currentSkip, currentTop, currentFilter);
  });
}

function addDeleteEventToAllMessages() {
  const deleteMessageButtons = document.getElementsByClassName('delete');
  Array.prototype.slice.call(deleteMessageButtons).forEach((button) => {
    button.addEventListener('click', (event) => {
      const messageContainer = button.parentNode;
      removeMessage(messageContainer.id);
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
            editMessage(messageContainer.id, messageInput.value);
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
    showMessages(currentSkip, currentTop, filter);
  });

  filterCancelButton.addEventListener('click', (event) => {
    const filtersBox = document.getElementById('filters');
    filtersBox.children[0].value = null;
    filtersBox.children[1].value = null;
    filtersBox.children[2].value = null;
    filtersBox.children[3].value = null;

    currentFilter = null;
    showMessages(currentSkip, currentTop, currentFilter);
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
    if (currentSelectedUser !== 'All') {
      addMessage(messageText, true, currentSelectedUser);
    } else {
      addMessage(messageText, false);
    }

    addEditEventToAllMessages();
    addDeleteEventToAllMessages();
    textInput.value = '';
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTo(0, document.body.scrollHeight);
  });
}

addFilterEvent();
addSelectUserEvent();
addLoadOtherMessagesButtonEvent();
addSendButtonEvent();
addDeleteEventToAllMessages();
addEditEventToAllMessages();
