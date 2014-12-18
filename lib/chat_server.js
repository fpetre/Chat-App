
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

		io.sockets.emit("addUser", {userName: guestNickname, users: nicknames});

		socket.on('disconnect', function(data){
			io.sockets.emit('userDisconnect', {user: nicknames[socket.id]});
			delete nicknames[socket.id];
			io.sockets.emit('removeUser', {users: nicknames});

		});

		socket.on('nicknameChangeRequest', function(data){
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
				io.sockets.emit('nicknameChangeUpdate', {users: nicknames});
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

		socket.on('errorMessage', function (data) {
			socket.emit('errorMessage', data);
		});


	});
}


module.exports = createChat;
