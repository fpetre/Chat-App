
function Chat(socket) {
	this.socket = socket;
};

Chat.prototype.sendMessage = function(data) {
	if(data.indexOf("/") === 0){
		if(data.indexOf("/nick") === 0){
			var nickname = data.split(' ')[1];
			this.socket.emit('nicknameChangeRequest', {text: nickname });
		}
	} else {
		  this.socket.emit('getmessage', {text: data });
	}

};

// module.exports = Chat;