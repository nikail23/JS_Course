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

		getPage(skip, top, filterConfig) {
			let messagesBuffer = this._messages.slice();

			if (!skip) skip = 0;
			if (!top) top = 10;

			if (filterConfig) {
				if (filterConfig.author) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].author.indexOf(filterConfig.author) == -1) {
							messagesBuffer.splice(i, 1);
							i--;
						}
				}

				if (filterConfig.dateFrom) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].createdAt < filterConfig.dateFrom) {
							messagesBuffer.splice(i, 1);
							i--;
						}
				}

				if (filterConfig.dateTo) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].createdAt > filterConfig.dateTo) {
							messagesBuffer.splice(i, 1);
							i--;
						}
				}

				if (filterConfig.text) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].text.indexOf(filterConfig.text) == -1) {
							messagesBuffer.splice(i, 1);
							i--;
						}
				}
			}

			function _compareDates(message1, message2) {
				return message1.createdAt - message2.createdAt;
			}
			messagesBuffer.sort(_compareDates);
			messagesBuffer = messagesBuffer.slice(skip, top + skip);

			return messagesBuffer;
		}

		get(id) {
			function _checkId(element) {
				if (element.id == id) {
					return true;
				}
				return false;
			}
			return this._messages.find(_checkId);
		}

		static validate(message) {
			if (!(typeof (message.id) == "string") ||
				!(typeof (message.author) == "string") ||
				!(typeof (message.text) == "string") ||
				!(message.createdAt instanceof Date) ||
				!(typeof (message.isPersonal) == "boolean") ||
				(message.to && !(typeof (message.to) == "string"))) {
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
			let nonValidateMessages = [];
			messages.forEach(message => {
				if (MessageList.validate(message)) {
					this._messages.push(message);
				}
				else {
					nonValidateMessages.push(message);
				}
			});
			return nonValidateMessages;
		}

		remove(id) {
			if (this._messages.indexOf(this.get(id)) != -1) {
				this._messages.splice(index, 1);
				return true;
			}
			return false;
		}

		edit(id, editedMessage) {
			if (MessageList.validate(editedMessage)) {
				let editableMessage = this.get(id);
				let index = this._messages.indexOf(editableMessage);
				this._messages[index] = editedMessage;
				return true;
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
		MessageList
	}
}());

const messages = [
	new chat.Message(
		"0",
		"Hello User1!",
		new Date(2020, 11, 01, 13, 30, 27),
		"User2",
		false,
	),

	new chat.Message(
		"1",
		"Hello!",
		new Date(2020, 11, 01, 13, 40, 53),
		"User1",
		false,
	),

	new chat.Message(
		"2",
		"Hello User2!",
		new Date(2020, 11, 01, 13, 50, 44),
		"User1",
		true,
		"User2"
	),

	new chat.Message(
		"3",
		"GG",
		new Date(2020, 11, 02, 11, 10, 54),
		"user3",
		false
	)
];

let messageList = new chat.MessageList(messages);

console.log("test0: \n");
let filterConfig = new chat.FilterConfig(
	"User2",
	new Date(2020, 11, 01, 13, 20, 27),
	new Date(2020, 11, 01, 13, 59, 27),
	"Hello User1!"
);
let filteredMessages = messageList.getPage(null, null, filterConfig);
filteredMessages.forEach(message => {
	console.log(message);
});

console.log("test1: \n");
filteredMessages = messageList.getPage(1, 2);
filteredMessages.forEach(message => {
	console.log(message);
});

console.log("test2: \n");
console.log(messageList.get("2"));

console.log("test3: \n");
let msg1 = new chat.Message("12", "Text", new Date(), "author", false);
console.log(chat.MessageList.validate(msg1));

console.log("test4: \n");
messageList.add(msg1);
console.log(messageList.get("12"));

console.log("test5: \n");
messageList.edit("12", new chat.Message("4", "Goodbye", new Date(), "user3", false));
console.log(messageList.get("4"));

console.log("test6: \n");
let messages2 = [
	new chat.Message("5", "text", new Date(), "author", false),
	new chat.Message(5, "text", new Date(), "author", false),
]
let nonValidateMessages = messageList.addAll(messages2);
console.log(messageList.getPage(undefined, undefined, undefined));
console.log("non validate messages: ");
console.log(nonValidateMessages[0]);

console.log("test7: \n");
let msg2 = new chat.Message("0", "text", new Date(), "author", false);
msg2.id = "1";
msg2.createdAt = new Date(2000);
msg2.author = "asdsfd";
console.log(msg2);