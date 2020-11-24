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
  constructor(messages) {
    this._messages = messages.slice();
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
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
    return unvalidatedMessages;
  }

  remove(id) {
    const message = this.get(id);
    if (message) {
      const index = this._messages.indexOf(message);
      if (this.user) {
        if (message.author === this.user) {
          this._messages.splice(index, 1);
          return true;
        }
        return false;
      }
      this._messages.splice(index, 1);
      return true;
    }
    return false;
  }

  edit(id, editedMessage) {
    function copy(sourceMessage, newMessage) {
      sourceMessage.id = newMessage.id;
      sourceMessage.author = newMessage.author;
      sourceMessage.text = newMessage.text;
      sourceMessage.isPersonal = newMessage.isPersonal;
      sourceMessage.to = newMessage.to;
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
            return true;
          }
          return false;
        }
        copy(editableMessage, editedMessage);
        return true;
      }
      return false;
    }
    return false;
  }

  clear() {
    this._messages = [];
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
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    messages.forEach((message) => {
      const infoString = `${message.isPersonal ? `Personal message to ${message.to}` : 'Common message'} from ${message.author},<br/> at ${message.createdAt.toLocaleString('en-US', options)}`;
      if (message.author === currentUser.name) {
        messagesHTML
          += `<div class="commonSentMessage">
          ${message.text}
          <img class="imgMes1 delete" src="https://icon-library.com/images/deleted-icon/deleted-icon-18.jpg"/>
          <img class="imgMes1 edit" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/OOjs_UI_icon_edit-ltr-progressive.svg/1024px-OOjs_UI_icon_edit-ltr-progressive.svg.png"/>
        </div>  
        <div class="info info2">${infoString}</div> `;
      } else {
        messagesHTML
          += `<div class="commonComeMessage">
          ${message.text}
        </div>  
        <div class="info info1">${infoString}</div> `;
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
  constructor(users, activeUsers, currentUser) {
    this._users = users;
    this._activeUsers = activeUsers;
    this._currentUser = currentUser;
  }

  setCurrentUser(name) {
    const activeUserIndex = this.getActiveUserIndex(name);
    if (activeUserIndex !== -1) {
      this._currentUser = this._activeUsers[activeUserIndex];
    }
  }

  getCurrentUser() {
    return this._currentUser;
  }

  addUser(name, avatar) {
    if (this.getUserIndex(name) === -1) {
      this._users.push(new User(name, avatar));
    }
  }

  setActiveUser(name) {
    const userIndex = this.getUserIndex(name);
    const activeUserIndex = this.getActiveUserIndex(name);
    if (userIndex !== -1 && activeUserIndex === -1) {
      this._activeUsers.push(this._users[userIndex]);
    }
  }

  setPassiveUser(name) {
    const activeUserIndex = this.getActiveUserIndex(name);
    if (activeUserIndex !== -1) {
      this._activeUsers.splice(activeUserIndex, 1);
    }
  }

  deleteUser(name) {
    const index = this.getUserIndex(name);
    if (index !== -1) {
      this._users.splice(index, 1);
    }
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
        ${user.name}
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
const messageListString = localStorage.getItem('messages');
let messageList;
if (messageListString) {
  messageList = new MessageList(JSON.parse(messageListString));
  messageList._messages.forEach((message) => {
    message.createdAt = new Date(message.createdAt);
  });
} else {
  messageList = new MessageList(readyMessages);
}
const messagesView = new MessagesView('messages');

const users = [
  new User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
  new User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
  new User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
  new User('User4', 'https://cdn.iconscout.com/icon/free/png-256/avatar-372-456324.png'),
];
const activeUsers = [
  new User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
  new User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
  new User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
];

const usersListString = localStorage.getItem('users');
const activeUsersListString = localStorage.getItem('activeUsers');
const currentUserString = localStorage.getItem('currentUser');

let userList;
if (usersListString !== 'null' && activeUsersListString !== 'null' && currentUserString !== 'null') {
  userList = new UserList(JSON.parse(usersListString), JSON.parse(activeUsersListString), JSON.parse(currentUserString));
} else {
  userList = new UserList(users, activeUsers, activeUsers[0]);
}
const activeUsersView = new ActiveUsersView('usersList');

function addMessage(text, isPersonal, to) {
  if (messageList.add(new Message(undefined, text, undefined, undefined, isPersonal, to))) {
    this.showMessages();
    return true;
  }
  return false;
}

function editMessage(id, text, isPersonal, to) {
  if (messageList.edit(id, new Message(undefined, text, undefined, undefined, isPersonal, to))) {
    this.showMessages();
    return true;
  }
  return false;
}

function removeMessage(id) {
  if (messageList.remove(id)) {
    this.showMessages();
    return true;
  }
  return false;
}

function showMessages() {
  messagesView.display(messageList.getPage(), userList.getCurrentUser());
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

// CONTROLLER

showActiveUsers();
showMessages();
setCurrentUser('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png');

const messageInput = document.getElementById('sendButton');
messageInput.addEventListener('click', (event) => {
  event.preventDefault();
  const textInput = document.getElementById('myInput');
  const messageText = textInput.value;
  if (messageText.length === 0) {
    return;
  }
  if (addMessage(messageText, false)) {
    textInput.value = '';
  }
});

localStorage.setItem('users', JSON.stringify(userList.getAllUsers()));
localStorage.setItem('activeUsers', JSON.stringify(userList.getAllActiveUsers()));
localStorage.setItem('messages', JSON.stringify(messageList._messages));
localStorage.setItem('currentUser', JSON.stringify(userList.getCurrentUser()));
