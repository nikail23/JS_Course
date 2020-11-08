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
      const nonValidateMessages = [];
      messages.forEach((message) => {
        if (MessageList.validate(message)) {
          this._messages.push(message);
        } else {
          nonValidateMessages.push(message);
        }
      });
      return nonValidateMessages;
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

const messages = [
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

let messageList = new chat.MessageList(messages);

console.log('test0: testing getPage filter \n');
const filterConfig = new chat.FilterConfig(
  'User2',
  new Date(2020, 11, 1, 13, 20, 27),
  new Date(2020, 11, 1, 13, 59, 27),
  'Hello User1!',
);
let filteredMessages = messageList.getPage(null, null, filterConfig);
filteredMessages.forEach((message) => {
  console.log(message);
});

console.log('test1: testing getPage method \n');
filteredMessages = messageList.getPage(1, 2);
filteredMessages.forEach((message) => {
  console.log(message);
});

console.log('test2: testing get method \n');
console.log(messageList.get('2'));

console.log('test3: testing validate method \n');
const msg1 = new chat.Message('12', 'Text', new Date(), 'author', false);
console.log(chat.MessageList.validate(msg1));

console.log('test4: testing add method \n');
messageList.add(msg1);
console.log(messageList.get('12'));

console.log('test5:  testing edit method \n');
messageList.edit('12', new chat.Message('4', 'Goodbye', new Date(), 'user3', false));
console.log(messageList.get('4'));

console.log('test6: testing addAll method \n');
const messages2 = [
  new chat.Message('5', 'text', new Date(), 'author', false),
  new chat.Message(5, 'text', new Date(), 'author', false),
];
const nonValidateMessages = messageList.addAll(messages2);
console.log(messageList.getPage(undefined, undefined, undefined));
console.log('non validate messages: ');
console.log(nonValidateMessages[0]);

console.log('test7: testing readonly fields \n');
const msg2 = new chat.Message('0', 'text', new Date(), 'author', false);
msg2.id = '1';
msg2.createdAt = new Date(2000);
msg2.author = 'asdsfd';
console.log(msg2);

console.log('test8: testing of user field \n');
messageList.user = 'User1';
messageList.remove('0');
messageList.remove('1');
messageList.edit('0', new chat.Message('0', 'text', new Date(), 'User1', false));
messageList.user = 'User2';
messageList.edit('0', new chat.Message('0', 'text', new Date(), 'User2', false));
let msgs = messageList.getPage(undefined, undefined, undefined);
msgs.forEach((message) => {
  console.log(message);
});

console.log('test9: testing of getPage with user field \n');
messageList = new chat.MessageList(messages);
messageList.user = 'User1';
msgs = messageList.getPage(undefined, undefined, undefined);
msgs.forEach((message) => {
  console.log(message);
});
// убирается сообщение с id == 2, т.к. оно недоступно пользователю User1

console.log('test10: testing of clear method \n');
messageList = new chat.MessageList(messages);
messageList.clear();
msgs = messageList.getPage(undefined, undefined, undefined);
console.log(msgs.length); // ожидается размер сообщений == 0
