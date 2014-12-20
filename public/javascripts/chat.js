
function Chat(socket) {
	this.socket = socket;
	this.room = "";
};

Chat.prototype.sendMessage = function(data) {
	this.socket.emit('getmessage', {text: data, room: this.room });
};

Chat.prototype.processCommand = function (data) {
	if(data.indexOf("/nick") === 0){
		var nickname = data.split(' ')[1];
		if (nickname === undefined) {
			this.socket.emit('errorMessage', {text: "name cant be blank"});
		} else {
			this.socket.emit('nicknameChangeRequest', {nickname: nickname });
		}
	} else if(data.indexOf("/join") === 0) {
		var room = data.split(' ')[1];
		if (room === undefined) {
			this.socket.emit('errorMessage', {text: "room name cant be blank"});
		} else {
			this.socket.emit('roomChangeRequest', {roomName: room});
		}
	} else {
		this.socket.emit('errorMessage', {text: "invalid command"});
	}
};

// module.exports = Chat;
