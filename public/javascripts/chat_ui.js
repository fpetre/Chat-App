// var Chat = require("./chat.js")
$( function(){
	var socket = io("http://localhost:8000");
	var chat = new Chat(socket);
	var $form = $("form");
	var nickname = "";
	var userList = [];

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
		}
		addMessage();
		$form.find("input#messages").val("");
	};

	var renderUserList = function () {
		$("#user-list").empty();
		for (var i = 0; i < userList.length; i++) {
			var userElement = $("<li id=" + userList[i] + ">" + userList[i] + "</li>");
			$("#user-list").append(userElement);
		}
	};

	var updateUserList = function (users) {
		var newUserList = [];
		for (var prop in users ) {
			if(!users.hasOwnProperty(prop)){
				continue;
			}
			newUserList.push(users[prop]);
		}

		userList = newUserList;
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
	});

	socket.on('sendmessage', function (data) {
		$(".user").text(nickname);
		$("#received-messages").text(data.text);
		$(".sender").text("sent from:" + data.user);
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
	});



	socket.on('removeUser', function (data){
		updateUserList(data.users);
		renderUserList();
	});



	$form.on("submit",function(event){
		event.preventDefault();
		getSendMessage();
	});

});
