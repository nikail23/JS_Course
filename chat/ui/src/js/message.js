const chat = (function () {
  class Message {
    constructor(id, text, createdAt, author, isPersonal, to) {
      this._id = id;
      this._text = text;
      this._createdAt = createdAt;
      this._author = author;
      this._isPersonal = isPersonal;
      this._to = to;
    }

    get id() {
      return this._id;
    }

    set id(value) {}

    get text() {
      return this._text;
    }

    set text(value) {
      this._text = value;
    }

    get createdAt() {
      return this._createdAt;
    }

    set createdAt(value) {}

    get author() {
      return this._author;
    }

    set author(value) {}

    get isPersonal() {
      return this._isPersonal;
    }

    set isPersonal(value) {
      this._isPersonal = value;
    }

    get to() {
      return this._to;
    }

    set to(value) {
      this._to = value;
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

      function _compareDates(message1, message2) {
        return message1.createdAt - message2.createdAt;
      }
      messagesBuffer.sort(_compareDates);

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
      function _checkId(element) {
        if (element.id === id) {
          return true;
        }
        return false;
      }
      return this._messages.find(_checkId);
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
        this._messages.push(message);
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
      if (MessageList.validate(editedMessage)) {
        const editableMessage = this.get(id);
        if (editableMessage) {
          if (this.user) {
            if (editableMessage.author === this.user) {
              const index = this._messages.indexOf(editableMessage);
              this._messages[index] = editedMessage;
              return true;
            }
            return false;
          }
          const index = this._messages.indexOf(editableMessage);
          this._messages[index] = editedMessage;
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

(function Tests() {
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

    const _messageList = new chat.MessageList(readyMessages);
    const _filterConfig = new chat.FilterConfig(
      'User2',
      new Date(2020, 11, 1, 13, 20, 27),
      new Date(2020, 11, 1, 13, 59, 27),
      'Hello User1!',
    );
    const _messages = _messageList.getPage(undefined, undefined, _filterConfig);

    const _resultText = `Status: ${(_messages.length === 1 && _messages[0].id === '0') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testGetPageMethod() {
    console.log('Test2: Testing getPage method. \n');

    const _messageList = new chat.MessageList(readyMessages);
    const _messages = _messageList.getPage(1, 2);

    const _resultText = `Status: ${(_messages.length === 2 && _messages[0].id === '1' && _messages[1].id === '2') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testGetMethod() {
    console.log('Test2: Testing get method. \n');

    const _messageList = new chat.MessageList(readyMessages);
    const _message = _messageList.get('2');

    const _resultText = `Status: ${(_message.id === '2') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testValidateMethod() {
    console.log('Test3: Testing validate method. \n');

    const _message = new chat.Message('12', 'Text', new Date(), 'author', false);
    const _isValidate = chat.MessageList.validate(_message);

    const _resultText = `Status: ${(_isValidate === true) ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testAddMethod() {
    console.log('Test4: Testing add method. \n');

    const _messageList = new chat.MessageList(readyMessages);
    const _message = new chat.Message('12', 'Text', new Date(), 'author', false);
    _messageList.add(_message);

    const _resultText = `Status: ${(_messageList.get('12').id === '12') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testEditMethod() {
    console.log('Test5: Testing edit method. \n');

    const _messageList = new chat.MessageList(readyMessages);
    _messageList.edit('3', new chat.Message('4', 'Goodbye', new Date(), 'user3', false));

    const _resultText = `Status: ${(_messageList.get('4').text === 'Goodbye') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testAddAllMethod() {
    console.log('Test6: Testing addAll method. \n');

    const _messageList = new chat.MessageList(readyMessages);
    const _anotherReadyMessages = [
      new chat.Message('5', 'text', new Date(), 'author', false),
      new chat.Message(5, 'text', new Date(), 'author', false),
    ];
    const _unvalidatedMessages = _messageList.addAll(_anotherReadyMessages);

    const _condition = _unvalidatedMessages.length === 1 && _unvalidatedMessages[0].id === 5 && _messageList.get('5');
    const _resultText = `Status: ${(_condition) ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testReadonlyFields() {
    console.log('Test7: Testing readonly fields. \n');

    const _date = new Date();
    const _message = new chat.Message('0', 'text', new Date(), 'author', false);
    _message.id = '1';
    _message.createdAt = new Date(2000);
    _message.author = 'asdsfd';

    const _resultText = `Status: ${(_message.id === '0' && _message.createdAt.toString() === _date.toString() && _message.author === 'author') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testUserField() {
    console.log('Test8: Testing of user field. \n');

    const _messageList = new chat.MessageList(readyMessages);
    _messageList.user = 'User1';
    _messageList.edit('0', new chat.Message('0', 'text', new Date(), 'User1', false));

    const _resultText = `Status: ${(_messageList.get('0').author === 'User2') ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testGetPageMethodWithUserField() {
    console.log('Test9: Testing of getPage with user field \n');

    let _messageList = new chat.MessageList(readyMessages);
    _messageList.user = 'User1';
    const _messages = _messageList.getPage(undefined, undefined, undefined);
    _messageList = new chat.MessageList(_messages);

    const _resultText = `Status: ${(_messageList.get('2') === undefined) ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
  }

  function _testClearMethod() {
    console.log('Test10: Testing of clear method. \n');

    const _messageList = new chat.MessageList(readyMessages);
    _messageList.clear();
    const _messages = _messageList.getPage(undefined, undefined, undefined);

    const _resultText = `Status: ${(_messages.length === 0) ? 'accepted!' : 'decline!'}`;
    console.log(_resultText);
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
