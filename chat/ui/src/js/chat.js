//
// CHAT BASE CLASSES
//
/* eslint-disable max-len */
const chat = (function () {
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
          if (messagesBuffer[i].isPersonal && messagesBuffer[i].to !== this.user) {
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
        const newMessage = new chat.Message(
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

    display(params) {
      // eslint-disable-next-line no-undef
      const container = document.getElementById(this.containerId);
      container.innerHTML = params;
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

    display(params) {
      // eslint-disable-next-line no-undef
      const container = document.getElementById(this.containerId);
      container.innerHTML = params;
    }
  }

  return {
    Message,
    FilterConfig,
    MessageList,
    MessagesView,
    UserList,
    ActiveUsersView,
    User,
  };
}());

// CHAT LOGIC
// MVC
//

const ChatLogic = (function () {
  const messages = [
    new chat.Message(
      '0',
      'Hello User1!',
      new Date(),
      'User2',
      false,
    ),

    new chat.Message(
      '1',
      'Hello!',
      new Date(),
      'User1',
      false,
    ),

    new chat.Message(
      '2',
      'Hello User2!',
      new Date(),
      'User1',
      true,
      'User2',
    ),

    new chat.Message(
      '3',
      'GG',
      new Date(),
      'user3',
      false,
    ),
  ];
  const messageList = new chat.MessageList(messages);
  messageList.user = 'User1';

  const messagesView = new chat.MessagesView('messages');

  function addMessage(text, isPersonal, to) {
    messageList.add(new chat.Message(undefined, text, undefined, undefined, undefined, isPersonal, to));
    this.showMessages();
  }

  function editMessage(id, text, isPersonal, to) {
    messageList.edit(id, new chat.Message(undefined, text, undefined, undefined, isPersonal, to));
    this.showMessages();
  }

  function removeMessage(id) {
    messageList.remove(id);
    this.showMessages();
  }

  function showMessages() {
    let messagesHTML = '';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    messageList.getPage(undefined, undefined).forEach((message) => {
      const infoString = `Author: ${message.author}, ${message.createdAt.toLocaleString('en-US', options)}`;
      if (message.author === messageList.user) {
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
    messagesView.display(messagesHTML);
  }

  const users = [
    new chat.User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
    new chat.User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
    new chat.User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
    new chat.User('User4', 'https://cdn.iconscout.com/icon/free/png-256/avatar-372-456324.png'),
  ];
  const activeUsers = [
    new chat.User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
    new chat.User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
    new chat.User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
  ];
  const userList = new chat.UserList(users, activeUsers);
  const activeUsersView = new chat.ActiveUsersView('usersList');

  function showActiveUsers() {
    let activeUsersHTML = '';
    userList.activeUsers.forEach((activeUser) => {
      activeUsersHTML
      += `<div class="user">
          <img src="${activeUser.avatar}" alt="">
          ${activeUser.name}
      </div>`;
    });
    activeUsersView.display(activeUsersHTML);
  }

  return {
    showMessages,
    showActiveUsers,
    addMessage,
    editMessage,
    removeMessage,
  };
}());

//
// TESTS
//

ChatLogic.showActiveUsers();
ChatLogic.showMessages();
ChatLogic.addMessage('Hi!');
ChatLogic.editMessage('4', 'hi!!!)))');
ChatLogic.removeMessage('4');

/** todo: Доделать FiltersView, HeaderView, правильно выводить сообщения для автора/адресата, протестировать ChatLogic */

(function MessagesTests() {
  const readyMessages = [
    new chat.Message(
      '0',
      'Hello User1!',
      new Date(),
      'User2',
      false,
    ),

    new chat.Message(
      '1',
      'Hello!',
      new Date(),
      'User1',
      false,
    ),

    new chat.Message(
      '2',
      'Hello User2!',
      new Date(),
      'User1',
      true,
      'User2',
    ),

    new chat.Message(
      '3',
      'GG',
      new Date(),
      'user3',
      false,
    ),
  ];

  function _testMessageFilter() {
    console.log('Test1: Testing getPage filter. \n');

    const messageList = new chat.MessageList(readyMessages);
    const filterConfig = new chat.FilterConfig(
      'User2',
      new Date(2020, 11, 1, 13, 20, 27),
      new Date(2020, 11, 1, 13, 59, 27),
      'Hello User1!',
    );
    const messages = messageList.getPage(undefined, undefined, filterConfig);

    const resultText = `Status: ${(messages.length === 1 && messages[0].id === '0') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testGetPageMethod() {
    console.log('Test2: Testing getPage method. \n');

    const messageList = new chat.MessageList(readyMessages);
    const messages = messageList.getPage(1, 2);

    const resultText = `Status: ${(messages.length === 2 && messages[0].id === '1' && messages[1].id === '2') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testGetMethod() {
    console.log('Test2: Testing get method. \n');

    const messageList = new chat.MessageList(readyMessages);
    const message = messageList.get('2');

    const resultText = `Status: ${(message.id === '2') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testValidateMethod() {
    console.log('Test3: Testing validate method. \n');

    const message = new chat.Message('12', 'Text', new Date(), 'author', false);
    const isValidate = chat.MessageList.validate(message);

    const resultText = `Status: ${(isValidate === true) ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testAddMethod() {
    console.log('Test4: Testing add method. \n');

    const messageList = new chat.MessageList(readyMessages);
    const message = new chat.Message('12', 'Text', new Date(), 'author', false);
    messageList.add(message);

    const resultText = `Status: ${(messageList.get('12').id === '12') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testEditMethod() {
    console.log('Test5: Testing edit method. \n');

    const messageList = new chat.MessageList(readyMessages);
    messageList.edit('3', new chat.Message('3', 'Goodbye2', new Date(), 'user3', false));

    const resultText = `Status: ${(messageList.get('3').text === 'Goodbye2') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testAddAllMethod() {
    console.log('Test6: Testing addAll method. \n');

    const messageList = new chat.MessageList(readyMessages);
    const anotherReadyMessages = [
      new chat.Message('5', 'text', new Date(), 'author', false),
      new chat.Message(5, 'text', new Date(), 'author', false),
    ];
    const unvalidatedMessages = messageList.addAll(anotherReadyMessages);

    const condition = unvalidatedMessages.length === 1 && unvalidatedMessages[0].id === 5 && messageList.get('5');
    const resultText = `Status: ${(condition) ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testReadonlyFields() {
    console.log('Test7: Testing readonly fields. \n');

    const date = new Date();
    const message = new chat.Message('0', 'text', new Date(), 'author', false);
    message.id = '1';
    message.createdAt = new Date(2000);
    message.author = 'asdsfd';

    const resultText = `Status: ${(message.id === '0' && message.createdAt.toString() === date.toString() && message.author === 'author') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testUserField() {
    console.log('Test8: Testing of user field. \n');

    const messageList = new chat.MessageList(readyMessages);
    messageList.user = 'User1';
    messageList.edit('0', new chat.Message('0', 'text', new Date(), 'User1', false));

    const resultText = `Status: ${(messageList.get('0').author === 'User2') ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testGetPageMethodWithUserField() {
    console.log('Test9: Testing of getPage with user field \n');

    let messageList = new chat.MessageList(readyMessages);
    messageList.user = 'User1';
    const messages = messageList.getPage(undefined, undefined, undefined);
    messageList = new chat.MessageList(messages);

    const resultText = `Status: ${(messageList.get('2') === undefined) ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  function _testClearMethod() {
    console.log('Test10: Testing of clear method. \n');

    const messageList = new chat.MessageList(readyMessages);
    messageList.clear();
    const messages = messageList.getPage(undefined, undefined, undefined);

    const resultText = `Status: ${(messages.length === 0) ? 'accepted!' : 'decline!'}`;
    console.log(resultText);
  }

  _testMessageFilter();
  _testGetPageMethod();
  _testGetMethod();
  _testValidateMethod();
  _testAddMethod();
  _testEditMethod();
  _testAddAllMethod();
  _testReadonlyFields();
  _testUserField();
  _testGetPageMethodWithUserField();
  _testClearMethod();
}());
