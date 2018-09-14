
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var fs = require('fs');

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/", express.static(__dirname + "/client"));
app.use("/shared", express.static(__dirname + "/shared"));
app.use("/dm", express.static(__dirname + "/client/dm.html"));
app.get("/player", function(req, res) {
	var name = req.query.name;
	console.log("Player " + name + " logged in.");
	res.sendFile(__dirname + "/client/player.html");
});

var port = 8080;
server.listen(port);
console.log("Listening on "+port);

var characters;
fs.readFile(__dirname + '/shared/characters.json', 'utf8', function (err, data) {
  if (err) throw err;
  characters = JSON.parse(data);
});

var players = {};
var dms = {};

io.sockets.on('connection', function(socket) {
	console.log("Connection with id: "+socket.id);
	players[socket.id] = socket;

	/* DM */
	socket.on("login-dm", function(data){
		delete players[socket.id];
		dms[socket.id] = socket;
		updatePCs();
	});

	/* Player */
	socket.on("save-sheet", function(data) {
		players[socket.id]["name"] = data.id;
		characters[data.id] = data.sheet;
		fs.writeFile(__dirname + '/shared/characters.json', JSON.stringify(characters), function(err) {
		  if(err) console.log(err)
			else console.log("Saved sheet for "+data.id);
		})
		updatePCs();
	});
	socket.on("load-sheet", function(data) {
		players[socket.id]["name"] = data.id;
		if (data.id in characters) {
			socket.emit("send-sheet", characters[data.id]);
			console.log("Loaded sheet for "+data.id);
		}
		updatePCs();
	});

	/* Shared */
	socket.on("disconnect", function() {
		//console.log("disconnect "+socket.id);
		if (socket.id in players){
			delete players[socket.id];
			//console.log(socket.id in players);
		} else if(socket.id in dms) {
			delete dms[socket.id];
		}
		updatePCs();
	});
});

function updatePCs() {
	if (dms != undefined) {
		var data = {};
		for (var id in players) {
			var name = players[id]["name"];
			if (name in characters) {
				data[name] = characters[name];
			}
		}
		for (var id in dms) {
			var dm = dms[id];
			dm.emit("send-pcs", data);
		}
	}
}
