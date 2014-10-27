
function _nameIsIncluded(nicknames, name){
	for(var key in nicknames) {
		if (name === nicknames[key]) {
			return true;
		}
	}
	return false;
};


function createChat(server) {
	var guestNumber = 0;
	var nicknames = {};
	var io = require('socket.io')(server);
	io.on('connection', function (socket) {
		guestNumber += 1;
		guestNickname = "user:" + guestNumber;
		if (!_nameIsIncluded(nicknames, guestNickname)) {
			nicknames[socket.id] = guestNickname;
			socket.emit('nicknameChangeResult', {
				success: true,
				message: "your guest nickname is:" + guestNickname,
				username: guestNickname
			});
		}

		socket.on('nicknameChangeRequest', function(data){
			console.log("nicknames", Object.keys(nicknames));
			console.log("data.text", data.text);
			console.log("is name included?",_nameIsIncluded(nicknames, data.text));
			if (data.text.indexOf("user") === 0) {
				socket.emit('nicknameChangeResult', {
					success: false,
					message: "names cannot begin with user"
				});
			} else if (_nameIsIncluded(nicknames, data.text)){
				socket.emit('nicknameChangeResult', {
					success: false,
					message: "name is taken"
				});
			} else {
				nicknames[socket.id] = data.text;
				socket.emit('nicknameChangeResult', {
					success: true,
					message: "your guest nickname is:" + data.text,
					username: data.text
				});
			}

		});

		socket.on('getmessage', function	(data) {
			socket.broadcast.emit('sendmessage', {text: data.text, user: nicknames[socket.id]});
		});
	});
}


module.exports = createChat;