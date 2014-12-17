
function Chat(socket) {
	this.socket = socket;
};

Chat.prototype.sendMessage = function(data) {
	this.socket.emit('getmessage', {text: data });
};

Chat.prototype.processCommand = function (data) {
	if(data.indexOf("/nick") === 0){
		var nickname = data.split(' ')[1];
		this.socket.emit('nicknameChangeRequest', {text: nickname });
	} else {
		this.socket.emit('errorMessage', {text: "invalid command"})
	}
};

// module.exports = Chat;
