const chat = (function () {
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

	const messages = [
		new Message(
			"0",
			"Hello User1!",
			new Date(2020, 11, 01, 13, 30, 27),
			"User2",
			false,
		),

		new Message(
			"1",
			"Hello!",
			new Date(2020, 11, 01, 13, 40, 53),
			"User1",
			false,
		),

		new Message(
			"2",
			"Hello User2!",
			new Date(2020, 11, 01, 13, 50, 44),
			"User1",
			true,
			"User2"
		),

		new Message(
			"3",
			"GG",
			new Date(2020, 11, 02, 11, 10, 54),
			"user3",
			false
		)
	]

	function getMessages(skip, top, filterConfig) {
		let messagesBuffer = messages;

		if (skip === undefined || skip == null)
			skip = 0;

		if (top === undefined || top == null)
			top = 10;

		let buffer = [];
		if (!(filterConfig === undefined)) {
			if (!(filterConfig.author === undefined)) {
				for (let i = 0; i < messagesBuffer.length; i++)
					if (messagesBuffer[i].author.indexOf(filterConfig.author) != -1) {
						buffer.push(messagesBuffer[i]);
					}
			}

			messagesBuffer = buffer;
			buffer = [];

			if (!(filterConfig.dateFrom === undefined)) {
				for (let i = 0; i < messagesBuffer.length; i++)
					if (messagesBuffer[i].createdAt >= filterConfig.dateFrom) {
						buffer.push(messagesBuffer[i]);
					}
			}

			messagesBuffer = buffer;
			buffer = [];

			if (!(filterConfig.dateTo === undefined)) {
				for (let i = 0; i < messagesBuffer.length; i++)
					if (messagesBuffer[i].createdAt <= filterConfig.dateTo) {
						buffer.push(messagesBuffer[i]);
					}
			}

			messagesBuffer = buffer;
			buffer = [];

			if (!(filterConfig.text === undefined)) {
				for (let i = 0; i < messagesBuffer.length; i++)
					if (messagesBuffer[i].text.indexOf(filterConfig.text) != -1) {
						buffer.push(messagesBuffer[i]);
					}
			}

			messagesBuffer = buffer;
			buffer = [];
		}

		function compareDates(message1, message2) {
			if (message1.createdAt > message2.createdAt) {
				return 1;
			}
			if (message1.createdAt < message2.createdAt) {
				return -1;
			}
			return 0;
		}
		messagesBuffer.sort(compareDates);


		function sliceFilter(element, index) {
			if (index < skip || index >= skip + top) {
				return false;
			}
			return true;
		}
		messagesBuffer = messagesBuffer.filter(sliceFilter);

		return messagesBuffer;
	}

	function getMessage(id) {
		function checkId(element) {
			if (element.id == id) {
				return true;
			}
			return false;
		}
		let messagesBuffer = messages;
		return messagesBuffer.filter(checkId)[0];
	}

	function validateMessage(message) {
		let id = message.id;
		let author = message.author;
		let text = message.text;
		let createdAt = message.createdAt;
		let isPersonal = message.isPersonal;
		let to;

		if (isPersonal) {
			to = message.to;
		}

		if (
			!(typeof (id) == "string") ||
			!(typeof (author) == "string") ||
			!(typeof (text) == "string") ||
			!(Object.prototype.toString.call(createdAt) === '[object Date]') ||
			!(typeof (isPersonal) == "boolean") ||
			(!(to === undefined) && (!(typeof (to) == "string")))
		) {
			return false;
		}

		return true;
	}

	function addMessage(msg) {
		messages.push(msg);
	}

	function editMessage(id, editedMessage) {
		let editMessage = this.getMessage(id);
		let index = messages.indexOf(editMessage);
		messages[index] = editedMessage;
	}

	return {
		getMessages,
		getMessage,
		addMessage,
		editMessage,
		validateMessage,
		Message,
		FilterConfig,
	}
}());

console.log("test0: \n");
let filterConfig = new chat.FilterConfig(
	"User2",
	new Date(2020, 11, 01, 13, 20, 27),
	new Date(2020, 11, 01, 13, 59, 27),
	"Hello User1!"
);
let filteredMessages = chat.getMessages(null, null, filterConfig);
filteredMessages.forEach(message => {
	console.log(message);
});

console.log("test1: \n");
filteredMessages = chat.getMessages(1, 2);
filteredMessages.forEach(message => {
	console.log(message);
});

console.log("test2: \n");
console.log(chat.getMessage("2"));

console.log("test3: \n");
let msg1 = new chat.Message("12", "Text", new Date(), "author", false);
console.log(chat.validateMessage(msg1));

console.log("test4: \n");
chat.addMessage(msg1);
console.log(chat.getMessage("12"));

console.log("test5: \n");
chat.editMessage("12", new chat.Message("4", "Goodbye", new Date(), "user3", false));
console.log(chat.getMessage("4"));