/* eslint-disable max-len */
const MessagesModule = (function () {
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
      || !(typeof (message.isPersonal) === 'boolean')
      || (message.to && !(typeof (message.to) === 'string'))) {
        return false;
      }
      return true;
    }

    add(message) {
      if (MessageList.validate(message)) {
        const newMessage = new MessagesModule.Message(
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
        if (MessageList.validate(message)) {
          this._messages.push(message);
        } else {
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

  return {
    Message,
    FilterConfig,
    MessageList,
  };
}());

const messages = [
  new MessagesModule.Message(
    '0',
    'Hello User1!',
    new Date(2020, 11, 1, 13, 30, 27),
    'User2',
    false,
  ),

  new MessagesModule.Message(
    '1',
    'Hello!',
    new Date(2020, 11, 1, 13, 40, 53),
    'User1',
    false,
  ),

  new MessagesModule.Message(
    '2',
    'Hello User2!',
    new Date(2020, 11, 1, 13, 50, 44),
    'User1',
    true,
    'User2',
  ),

  new MessagesModule.Message(
    '3',
    'GG',
    new Date(2020, 11, 2, 11, 10, 54),
    'user3',
    false,
  ),
];
const messageList = new MessagesModule.MessageList(messages);
messageList.user = 'User1';

class MessagesView {
  constructor(containerId) {
    this.containerId = containerId;
  }

  display(params) {
    // eslint-disable-next-line no-undef
    const container = document.getElementById(this.containerId);
    container.insertAdjacentHTML('beforeend', params);
  }
}
const messagesView = new MessagesView('messages');

/* function addMessage(text, isPersonal, to) {

}

function editMessage() {

}

function removeMessage() {

} */

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

showMessages();

/* (function Tests() {
  const readyMessages = [
    new chat.Message(
      '0',
      'Hello User1!',
      new Date(2020, 11, 1, 13, 30, 27),
      'User2',
      false,
    ),

    new chat.Message(
      '1',
      'Hello!',
      new Date(2020, 11, 1, 13, 40, 53),
      'User1',
      false,
    ),

    new chat.Message(
      '2',
      'Hello User2!',
      new Date(2020, 11, 1, 13, 50, 44),
      'User1',
      true,
      'User2',
    ),

    new chat.Message(
      '3',
      'GG',
      new Date(2020, 11, 2, 11, 10, 54),
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
}()); */
