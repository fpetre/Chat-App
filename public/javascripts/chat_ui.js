// var Chat = require("./chat.js")
$( function(){
	if (typeof HEROKU_URL === 'undefined' ) {
		var url = "http://localhost:8000"
	} else {
		var url = HEROKU_URL
	}
	var socket = io(url);
	var chat = new Chat(socket);
	var $form = $("form");
	var nickname = "";
	var currentRoom = "";
	var userList = {};
	var roomList = {};
	var chatLog = [];

	var getMessage = function () {
		return $form.find("input#messages").val();
	};

	var sendToAll = function () {
		chat.sendMessage(getMessage());
	};

	var addMessage = function () {
		$("#sent-messages").text(getMessage());
	};

	var getSendMessage = function () {
		if (getMessage().indexOf("/") === 0) {
			chat.processCommand(getMessage());
		} else {
			sendToAll();
			updateChatLog(nickname, getMessage());
			renderChatLog();
		}
		addMessage();
		$form.find("input#messages").val("");
	};

	var renderUserList = function () {
		$("#user-list").empty();
		for (var userId in userList) {
			var userElement = $("<li id=" + userList[userId] + ">" + userList[userId] + "</li>");
			$("#user-list").append(userElement);
		}
	};

	var updateUserList = function (users) {
		userList = users;
	};



	var renderRoomList = function () {
		$("#room-list").empty();
		for (var room in roomList) {
			var roomElement = $("<li id=" + room + ">" + room + "</li>");
			$("#room-list").append(roomElement);
		}
	};

	var updateRoomList = function (rooms) {
		var newRoomList = {};
		for (var prop in rooms) {
			var roomName = rooms[prop];
			if(!rooms.hasOwnProperty(prop)){
				continue;
			}
			if (newRoomList[roomName] === undefined) {
				newRoomList[roomName] = [prop];
			} else {
				newRoomList[roomName].push(prop);
			}
		}
		roomList = newRoomList;
	};

	var renderCurrentRoomUsers = function () {
		if (roomList[currentRoom] !== undefined) {
			$("#room-user-list").empty();
			roomList[currentRoom].forEach(function (userId) {
				var username = userList[userId];
				var userElement = $("<li id=" + username + ">" + username + "</li>");
				$("#room-user-list").append(userElement);
			});
		}
	};

	var clearChatLog = function () {
		chatLog = [];
	};

	var updateChatLog = function (sender, message) {
		chatLog.push([sender, message]);
	};

	var renderChatLog = function () {
		$("#chat-log").empty();
		for (var i = 0; i < chatLog.length; i++) {
			var sender = chatLog[i][0];
			var message = chatLog[i][1];
			var senderElement = $("<span class='chat-log-item-sender'>" + sender + "</span>");
			var messageElement = $("<span class='chat-log-item-message'>" + message + "</span>");
			var chatLogItem = $("<li class='chat-log-item'></li>");
			chatLogItem.append(senderElement);
			chatLogItem.append(messageElement);
			$("#chat-log").append(chatLogItem);			
		};
	};


	socket.on('nicknameChangeResult', function (data){
		if (data.success === true) {
			nickname = data.username;
			$(".user").text(nickname);
		}
			$("#received-messages").text(data.message);
			$(".sender").text("sent from server");
	});

	socket.on("nicknameChangeUpdate", function (data) {
		updateUserList(data.users);
		renderUserList();
		renderCurrentRoomUsers();
	});

	socket.on('roomChangeResult', function (data){
		if (data.success === true) {
			currentRoom = data.roomName;
			$(".room").text(currentRoom);
			renderCurrentRoomUsers();
			clearChatLog();
			renderChatLog();
		}
		$("#received-messages").text(data.message);
		$(".sender").text("sent from server");

	});

	socket.on("roomUpdate", function (data){
		updateRoomList(data.currentRooms);
		renderRoomList();
		renderCurrentRoomUsers();
	});

	socket.on('sendmessage', function (data) {
		updateChatLog(data.user, data.text);
		$(".user").text(nickname);
		$("#received-messages").text(data.text);
		$(".sender").text("sent from:" + data.user);
		renderChatLog();

	});

	socket.on('errorMessage', function (data){
		$("#received-messages").text(data.text);
		$(".sender").text("sent from server");
	});

	socket.on('userDisconnect', function (data){
		$("#received-messages").text(data.user + " has left the chat");
		$(".sender").text("sent from server");
	});

	socket.on('addUser', function (data){
		updateUserList(data.users);
		renderUserList();
		renderCurrentRoomUsers();
	});



	socket.on('removeUser', function (data){
		updateUserList(data.users);
		renderUserList();
		renderCurrentRoomUsers();
	});



	$form.on("submit",function(event){
		event.preventDefault();
		getSendMessage();
	});

});
