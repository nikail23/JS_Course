// module

(function () {

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

	class MessagesList {
		constructor(messages) {
			this.messages = messages;
		}

		getMessages(skip, top, filterConfig) {
			let messagesBuffer = messages;

			if (skip === undefined)
				skip = 0;

			if (top === undefined)
				top = 10;

			if (!(filterConfig === undefined)) {
				if (!(filterConfig.author === undefined)) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].author.indexOf(filterConfig.author) == -1) {
							messagesBuffer.splice(i, 1);
						}
				}

				if (!(filterConfig.dateFrom === undefined)) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].createdAt < filterConfig.dateFrom) {
							messagesBuffer.splice(i, 1);
						}
				}

				if (!(filterConfig.dateTo === undefined)) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].createdAt > filterConfig.dateTo) {
							messagesBuffer.splice(i, 1);
						}
				}

				if (!(filterConfig.text === undefined)) {
					for (let i = 0; i < messagesBuffer.length; i++)
						if (messagesBuffer[i].text.indexOf(filterConfig.text) == -1) {
							messagesBuffer.splice(i, 1);
						}
				}
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

		getMessage(id) {
			function checkId(element) {
				if (element.id == id) {
					return true;
				}
				return false;
			}
			let messagesBuffer = messages;
			return messagesBuffer.filter(checkId)[0];
		}

		static validateMessage(message) {
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

		addMessage(msg) {
			messages.push(msg);
		}

		editMessage(id, editedMessage) {
			let editMessage = this.getMessage(id);
			let index = messages.indexOf(editMessage);
			messages[index] = editedMessage;
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
			new Date(2020, 11, 01, 14, 20, 44),
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

	let messagesList = new MessagesList(messages);
	let filterConfig = new FilterConfig(
		"User2",
		new Date(2020, 11, 01, 13, 45, 27),
		new Date(2020, 11, 01, 13, 55, 27),
		"Hello User1!"
	);

	let filteredMessages = messagesList.getMessages(1, 2);

	console.log("test1: \n");
	filteredMessages.forEach(message => {
		console.log(message);
	});

	console.log("test2: \n");
	console.log(messagesList.getMessage("2"));

	console.log("test3: \n");
	let msg1 = new Message("12", "Text", new Date(), "author", false);
	console.log(MessagesList.validateMessage(msg1));

	console.log("test4: \n");
	messagesList.addMessage(msg1);
	console.log(messagesList.getMessage("12"));

	console.log("test5: \n");
	messagesList.editMessage("12", new Message("4", "Goodbye", new Date(), "user3", false));
	console.log(messagesList.getMessage("4"));

}());