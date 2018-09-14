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

function loadCharacterData(res) {
	character = res;
	loadCharacter(
		res["noteList"]["name"],
		res["noteList"]["class"],
		res["improvedInitiative"],
		res["baseSpeed"],
		res["armorBonus"]
	);
}

function loadCharacter(n, c, i, s, a){
	document.getElementById("name").innerHTML = n;
	document.getElementById("class-info").innerHTML = c;

	var txt = "Initiative: " + i + "<br/>";
	txt += "Speed: " + s + "<br/>";
	txt += "Armor Class: " + a + "<br/>";
	document.getElementById("demo").innerHTML = txt;

	var x = document.getElementById("fileSheet");
	if (x != undefined) {
		x.parentNode.removeChild(x);
	}
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
