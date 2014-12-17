// var Chat = require("./chat.js")
$( function(){
	var socket = io("http://localhost:8000");
	var chat = new Chat(socket);
	var $form = $("form");
	var nickname = "";

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


	socket.on('nicknameChangeResult', function (data){
		if (data.success === true) {
			nickname = data.username;
			$(".user").text(nickname);
		}
			$("#received-messages").text(data.message);
			$(".sender").text("sent from server");
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

	$form.on("submit",function(event){
		event.preventDefault();
		getSendMessage();
	});

});
