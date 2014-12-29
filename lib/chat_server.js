

function createChat(server) {
	var guestNumber = 0;
	var nicknames = {};
	var currentRooms = {};

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

		_joinRoom("lobby");

		io.to(currentRooms[socket.id]).emit("addUser", {
			userName: guestNickname,
			users: nicknames
		});

		socket.on('disconnect', function(data){
			io.to(currentRooms[socket.id]).emit('userDisconnect', {
				user: nicknames[socket.id]
			});
			delete nicknames[socket.id];
			io.to(currentRooms[socket.id]).emit('removeUser', {users: nicknames});
			delete currentRooms[socket.id];
			io.sockets.emit('roomUpdate', {currentRooms: currentRooms});
		});

		socket.on('roomChangeRequest', _handleRoomChangeRequests);

		socket.on('nicknameChangeRequest', function(data){
			if (data.nickname.indexOf("user") === 0) {
				socket.emit('nicknameChangeResult', {
					success: false,
					message: "names cannot begin with user"
				});
			} else if (_nameIsIncluded(nicknames, data.nickname)){
				socket.emit('nicknameChangeResult', {
					success: false,
					message: "name is taken"
				});
			} else if (data.nickname === "") {
				socket.emit('nicknameChangeResult', {
					success: false,
					message: "name cant be blank"
				});
			} else {
				nicknames[socket.id] = data.nickname;
				io.sockets.emit('nicknameChangeUpdate', {
					users: nicknames
				});
				socket.emit('nicknameChangeResult', {
					success: true,
					message: "your guest nickname is:" + data.nickname,
					username: data.nickname
				});
			}

		});

		socket.on('getmessage', function	(data) {
			socket.broadcast.to(currentRooms[socket.id]).emit('sendmessage', {
				text: data.text,
				user: nicknames[socket.id]
			});
		});

		socket.on('errorMessage', function (data) {
			socket.emit('errorMessage', data);
		});

	// helper functions

	function _nameIsIncluded(nicknames, name){
		for(var key in nicknames) {
			if (name === nicknames[key]) {
				return true;
			}
		}
		return false;
	};

	function _joinRoom(room){
		socket.join(room);
		currentRooms[socket.id] = room;
		io.sockets.emit('roomUpdate', {currentRooms: currentRooms});
		socket.emit('roomChangeResult', {
			success: true,
			message: "you are now in room: " + room,
			roomName: room
		});
	};

	function _handleRoomChangeRequests(data) {
		if (data.roomName === currentRooms[socket.id]) {
			socket.emit('roomChangeResult', {
				success: false,
				message: "already in room " + data.roomName
			});
		} else if (data.roomName === "") {
			socket.emit('roomChangeResult', {
				success: false,
				message: "room name cant be blank"
			});
		} else {
			socket.leave(currentRooms[socket.id]);
			delete currentRooms[socket.id];
			_joinRoom(data.roomName);
		}
	};
});
}


module.exports = createChat;
