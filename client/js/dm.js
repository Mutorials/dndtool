var socket = io();

class domTable {
	constructor(list, table) {
		this.list = document.getElementById(list);
		this.list.innerHTML = "";
		this.table = document.getElementById(table).children[0].cloneNode(true);
		this.tbody = this.table.children[1];
	}

	addRow(items) {
		var row = document.createElement("tr");
		for (var k in items) {
			var item = items[k];
			var td = document.createElement("td");
			if (item instanceof HTMLElement) {
				td.appendChild(item);
			} else {
				td.innerHTML = item;
			}
			row.appendChild(td);
		}
		this.tbody.appendChild(row);
	}
//WOW das echt superdeluxe dynamixx af boooiii
	create() {
		this.list.innerHTML = "";
		this.list.appendChild(this.table);
	}
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
		f: startHome,
		buttons: [undefined, undefined, cancelInitEncounter, startInitEncounter],
		buttonNames: ["Home", "Settings", "Cancel", "Init Battle"]
	},
	roll: {
		dom: document.getElementById("roll"),
		f: startRoll,
		buttons: [rollAll, undefined, cancelRoll, function(){setState("encounter")}],
		buttonNames: ["Roll", "Settings", "Cancel", "Start Encounter"]
	},
	encounter: {
		dom: document.getElementById("encounter"),
		f: startEncounter,
		buttons: [cancelEncounter, undefined, undefined, updateTurn],
		buttonNames: ["End Encounter", "Settings", "", "End Turn"]
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
	currentScene = sceneId;
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

var pcs = {};
socket.emit("login-dm", {});
socket.on("send-pcs", function(data) {
	pcs = data;
	for (var id in pcs) {
		var pc = pcs[id];
		if (pc.initroll != undefined) {
			pc.type = "Player";
			bcs[id] = pc;
		}
	}
	updatePCs();
	updateBCs();
});

function updatePCs() {
	var table = new domTable("list-pcs", "pc-table");
	for (var id in pcs) {
		var pc = pcs[id];
		var name = pc["noteList"]["name"];
		var c = pc["noteList"]["class"];
		var health = pc["maxHealth"];
		var dex = pc["maxDex"];
		table.addRow({name, c, health, dex});
	}
	table.create();
}

function updateMonsters() {
	var table = new domTable("list-npcs", "npc-table");
	for (var id in npcs) {
		var npc = npcs[id];
		var name = npc.name;
		var health = npc.health;
		var dex  = npc.maxDex;
		table.addRow({name, health, dex});
	}
	table.create();
}

var bcs = {};
var npcs = {};
function updateBCs() {
	var table = new domTable("list-bcs", "bc-table");
	for (var id in bcs) {
		var ent = bcs[id];
		var type = ent.type;
		var roll = ent.initroll;
		var dex = ent.maxDex;
		var name;
		if (type == "Player") {
			name = ent["noteList"]["name"];
		} else {
			name = ent.name;
		}
		if (roll !== undefined) bcs[id].init = Math.floor((dex-10)/2) + roll;
		table.addRow({name, type, roll, dex});
	}
	table.create();
}

function addMonster(data) {
	npcs[data.name] = data;
	updateMonsters();
}

function confirmMonster() {
	var form = document.getElementById("monster-form");
	var fields = form.childNodes[0];
	var name = fields.querySelector("#monster-name").value;
	var health = fields.querySelector("#monster-health").value;
	var dex = fields.querySelector("#monster-dex").value;
	cancelMonster();
	if (name == "") return;
	addMonster({name: name, health: health, maxDex: dex});
}

function cancelMonster() {
	var form = document.getElementById("monster-form");
	form.parentNode.removeChild(form);
	var buttonDiv = document.getElementById("monster-add");
	buttonDiv.classList.remove("hidden");
}

function matchNpcName(npc) {
	if (npcs[npc.name] != undefined) {
		var matches = npc.name.match(/\d+$/);
		var n = 1;
		if (matches) {
			n = parseInt(matches[0], 10) + 1;
			console.log(n);
			var l = matches[0].toString().length;
			npc.name = npc.name.slice(0,-(l+1));
		}
		npc.name += " " + n;
		npc.name = matchNpcName(npc);
	}
	return npc.name;
}

function loadEncounterData(data) {
	for (var id in data) {
		var npc = data[id];
		npc.name = matchNpcName(npc);
		addMonster(npc);
	}
}

function uploadEncounter(){
	read = new FileReader();

	var x = document.getElementById("fileEncounter");
	for (var id in x.files) {
		var file = x.files[id];
		if (!(file instanceof Blob)) continue;
		read.onloadend = function() {
			var res = JSON.parse(read.result);
			loadEncounterData(res);
		}
		read.readAsText(file);
	}
}

function saveEncounter() {
  var text = JSON.stringify(npcs);
  var filename = $("#encounterName").val()
  var blob = new Blob([text], {type: "application/json"});
  saveAs(blob, filename+".json");
}

function startInitEncounter() {
	npcs = {};
	var x = document.getElementById("init-encounter");
	x.innerHTML = "";
	var monsterInput = document.getElementById("monster-input").innerHTML;
	var encounterIO = document.getElementById("encounterIO").innerHTML;

	buttons[3].value = "Start Rolls";
	buttons[3] = clearButton(buttons[3]);
	buttons[3].addEventListener("click", function(){
		setState("roll");
	});

	buttons[2].value = "Cancel";
	buttons[2] = clearButton(buttons[2]);
	buttons[2].addEventListener("click", cancelInitEncounter);

	var monsterTitle = document.createElement("h4");
	monsterTitle.innerHTML = "Monsters";
	x.appendChild(monsterTitle);

	var encDiv = document.createElement("div");
	encDiv.id = "encounterDiv";
	encDiv.innerHTML = encounterIO;
	x.appendChild(encDiv);

	var npcList = document.createElement("div");
	npcList.id = "list-npcs";
	x.appendChild(npcList);

	var buttonDiv = document.createElement("div");
	var button = document.createElement("input");
	buttonDiv.id = "monster-add";
	buttonDiv.appendChild(button);
	button.type = "button";
	button.value = "Add monster";
	button.addEventListener("click", function() {
		var form = document.createElement("form");
		form.id = "monster-form";
		var div = document.createElement("div");
		div.innerHTML = monsterInput;
		form.appendChild(div);
		buttonDiv.classList.add("hidden");
		x.appendChild(form);
	});
	x.appendChild(buttonDiv);

}
buttons[3].addEventListener("click", startInitEncounter);

function cancelInitEncounter() {
	changeScene("home");
}

function startHome() {
	npcs = {};
	var x = document.getElementById("init-encounter");
	x.innerHTML = "";
}

function cancelRoll() {
	bcs = {};
	updateBCs();
	setState("home");
}

function rollAll() {
	var forms = document.getElementById("monster-rolls");
	forms.innerHTML = "";

	for (var id in npcs) {(function() {
		var npc = npcs[id];
		var r = Math.floor(Math.random() * 20) + 1;
		bcs[npc.name] = {name: npc.name, type: "Monster", health: npc.health, maxDex: npc.maxDex, initroll: r};
		updateBCs();
		return false;
	}());}
}

function startRoll() {
	bcs = {};
	updateBCs();
	var dom = document.getElementById("roll");
	var forms = document.getElementById("monster-rolls");
	var title = document.getElementById("roll-title");
	title.innerHTML = "Rolling Initiative";
	var initform = document.getElementById("monster-initroll");
	for (var id in npcs) {(function() {
		var npc = npcs[id];
		var form = initform.children[0].cloneNode(true);
		var label = form.querySelector("#npc-id");
		label.innerHTML = npc.name;

		var roll = form.children[0].children[0].children[1];

		var button = form.children[0].children[1].children[1];
		button.addEventListener("click", function() {
			forms.removeChild(form);
			bcs[npc.name] = {name: npc.name, type: "Monster", health: npc.health, maxDex: npc.maxDex, initroll: roll.value};
			updateBCs();
			return false;
		});

		forms.appendChild(form);
	}());}
}

function cancelEncounter() {
	setState("home");
}

function updateEncounter() {
	var table = new domTable("list-enc", "enc-table");

	var ents = Object.keys(bcs).map(function(key) {
	  return [key, bcs[key]];
	});
	ents.sort(function(a, b) {
	  return (b[1].init - a[1].init) || (b[1].maxDex - a[1].maxDex);
	});

	for (var id in ents) {
		var ent = ents[id][1];
		var tracker = '<div id="ent-'+id+'"></div>'
		var type = ent.type;
		var init = ent.init;
		var name,heatlh;
		if (type == "Player") {
			name = ent.noteList.name;
			health = ent.maxHealth;
		} else {
			name = ent.name;
			health = document.createElement("input");
			health.type = "number";
			if (health.value == "") health.value = ent.health;
			health.step = 1;
			health.min = 0;
			health.max = ent.health;
			health.addEventListener("onchange", function() {
				ents[id][1].health = health.value;
			}());
		}
		table.addRow({tracker, name, type, health, init});
	}
	table.create();
}

var turnId = -1;
function updateTurn() {
	var l;
	if (bcs.length === undefined) l = Object.keys(bcs).length;
	else l = bcs.length;
	if (l <= 0) return;
	if (turnId >= 0) {
		var h = document.getElementById("ent-"+turnId);
		h.innerHTML = "";
	}
	turnId = (turnId+1+l)%l;
	console.log(turnId);
	var h = document.getElementById("ent-"+turnId);
	h.innerHTML = ">>";
}

function startEncounter() {
	updateEncounter();
	turnId = -1;
	updateTurn();
}
