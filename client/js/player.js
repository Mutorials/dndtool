var socket = io();

var character;
function uploadSheet(){
	read = new FileReader();
	parser = new DOMParser();

	var x = document.getElementById("fileSheet");
	var txt = "";
	var file = x.files[0];
	read.readAsBinaryString(file);
	read.onloadend = function() {
		xmlDoc = parser.parseFromString(read.result,"text/xml");
		var res = parseSheet(xmlDoc);
		loadCharacterData(res);
		var data = {"id":name, "sheet":res};
		socket.emit("save-sheet", data);
	}

}

function confirmPlayer() {
	var form = document.getElementById("player-form");
	var fields = form.childNodes[0];
	var pname = document.getElementById("player-name").value;
	var pclass = document.getElementById("player-class").value;
	var health = document.getElementById("player-health").value;
	var dex = document.getElementById("player-dex").value;
	if (name == "") return;
	var data = {};
	data.noteList = {};
	data.noteList.name = pname;
	data.noteList.class = pclass;
	data.maxHealth = health;
	data.maxDex = dex;
	loadCharacterData(data);
	var res = {"id":name, "sheet":data};
	socket.emit("save-sheet", res);
	changeScene("home");
}

function loadCharacterData(data) {
	character = data;
	loadCharacter(
		data.noteList.name,
		data.noteList.class,
		data.maxHealth,
		data.maxDex
	);
}

function loadCharacter(n, c, h, d){
	document.getElementById("name").innerHTML = n;
	document.getElementById("class-info").innerHTML = c;

	var txt = "Max health: " + h + "<br/>";
	txt    += "Dexterity:  " + d + "<br/>";
	document.getElementById("demo").innerHTML = txt;

	var x = document.getElementById("playerInput");
	x.classList.add("hidden");
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var name = getParameterByName("name");
document.getElementById("name").innerHTML = name;

socket.emit("load-sheet", {"id":name});
socket.on("send-sheet", function(data) {
	loadCharacterData(data);
});

function showImport() {
	var x = document.getElementById("playerInput");
	buttons[1] = clearButton(buttons[1]);
	buttons[1].value = "Cancel import";
	buttons[1].addEventListener("click", function() {
		x.classList.add("hidden");
		changeScene("home");
	});
	x.classList.remove("hidden");
}


socket.on("state-change", changeState)
function changeState(data) {
	changeScene(data);
}
function setState(state) {
	socket.emit("set-state", state);
}
function loadState() {
	socket.emit("load-state", {});
}
loadState();
var scenes = {
	home: {
		dom: document.getElementById("home"),
		f: function(){},
		buttons: [undefined, showImport, undefined, undefined],
		buttonNames: ["Home", "Import", "", ""]
	},
	roll: {
		dom: document.getElementById("roll"),
		f: function(){},
		buttons: [undefined, undefined, undefined, undefined],
		buttonNames: ["Roll", "", "", ""]
	}
}
var currentScene = "home";
function changeScene(sceneId) {
	for (var id in scenes){
		var scene = scenes[id];
		scene.dom.classList.add("hidden");
	}
	var scene = scenes[sceneId];
	scene.dom.classList.remove("hidden");
	scene.f();
	setButtons(scene);
	currentScene = scene;
}
var buttons = [
	document.getElementById("b-top-left"),
	document.getElementById("b-top-right"),
	document.getElementById("b-down-left"),
	document.getElementById("b-down-right")
]
function setButtons(scene) {
	for (var i = 0; i < buttons.length; i++) {
		buttons[i] = clearButton(buttons[i]);
		buttons[i].value = scene.buttonNames[i];
		buttons[i].addEventListener("click", scene.buttons[i]);
	}
}
function clearButton(button) {
	var new_button = button.cloneNode(true);
	button.parentNode.replaceChild(new_button, button);
	return new_button;
}


$('#roll-form').submit(function () {
 confirmRoll();
 return false;
});
function confirmRoll() {
	var initInput = document.getElementById("player-init");
	var form = document.getElementById("roll-form");
	var title = document.getElementById("roll-title");
	var dom = document.getElementById("roll");

	title.innerHTML = "Rolled " + initInput.value + ": Waiting...";
	socket.emit("init-roll", initInput.value);
}
