/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
class Message {
  constructor(id, text, createdAt, author, isPersonal, to) {
    this._id = id;
    this.text = text;
    this._createdAt = createdAt;
    this._author = author;
    this.isPersonal = isPersonal;
    this.to = to;
  }

  get id() {
    return this._id;
  }

  set id(value) {}

  get createdAt() {
    return this._createdAt;
  }

  set createdAt(value) {}

  get author() {
    return this._author;
  }

  set author(value) {}
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

    messagesBuffer = messagesBuffer.slice(skip, top + skip);

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
      message._author = this.user;
    }
    if (message.id === undefined) {
      message._id = String(Number(this._messages[this._messages.length - 1].id) + 1);
    }
    if (message.createdAt === undefined) {
      message._createdAt = new Date();
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
      editedMessage._author = this.user;
    }
    if (editedMessage.id === undefined) {
      editedMessage._id = String(Number(this._messages[this._messages.length - 1].id) + 1);
    }
    if (editedMessage.createdAt === undefined) {
      editedMessage._createdAt = new Date();
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
  constructor(users, activeUsers) {
    this.users = users;
    this.activeUsers = activeUsers;
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
const messageList = new MessageList(readyMessages);
messageList.user = 'User1';
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
const userList = new UserList(users, activeUsers);
const activeUsersView = new ActiveUsersView('usersList');
let currentUser = activeUsers[0];

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

function showMessages() {
  messagesView.display(messageList.getPage(), currentUser);
}

function showActiveUsers() {
  activeUsersView.display(userList.activeUsers, currentUser);
}

function setCurrentUser(name, avatar) {
  currentUser = new User(name, avatar);
  messageList.user = currentUser.name;
  const headerView = new HeaderView('avatar', 'currentUser');
  headerView.display(currentUser.avatar, currentUser.name);
  this.showMessages();
  this.showActiveUsers();
}

// TESTS

showActiveUsers();
showMessages();
setCurrentUser('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png');
// setCurrentUser('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png');
addMessage('Hi!', true, 'User2');
editMessage('4', 'hi!!!)))', true, 'User2');
// removeMessage('4');
