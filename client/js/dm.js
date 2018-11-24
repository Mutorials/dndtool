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
			td.innerHTML = item;
			row.appendChild(td);
		}
		this.tbody.appendChild(row);
	}

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
		buttons: [undefined, undefined, cancelRoll, function(){setState("encounter")}],
		buttonNames: ["Roll", "Settings", "Cancel", "Start Encounter"]
	},
	encounter: {
		dom: document.getElementById("encounter"),
		f: startEncounter,
		buttons: [cancelEncounter, undefined, undefined, undefined],
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

var pcs = {};
var bcs = {};
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
		var dex = pc.abilityScores["dex-score"];
		table.addRow({name, c, health, dex});
	}
	table.create();
}

var npcs = {};
function updateMonsters() {
	var table = new domTable("list-npcs", "npc-table");
	for (var id in npcs) {
		var npc = npcs[id];
		var name = npc.name;
		var health = npc.health;
		var dex  = npc.dex;
		table.addRow({name, health, dex});
	}
	table.create();
}

function updateBCs() {
	var table = new domTable("list-bcs", "bc-table");
	for (var id in bcs) {
		var ent = bcs[id];
		var type = ent.type;
		var roll = ent.initroll;
		var name,dex;
		if (type == "Player") {
			name = ent["noteList"]["name"];
			dex = ent.abilityScores["dex-score"];
		} else {
			name = ent.name;
			dex = ent.dex;
		}
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
	cancelMonster()
	if (name == "") return;
	addMonster({name: name, health: health, dex: dex});
}

function cancelMonster() {
	var form = document.getElementById("monster-form");
	form.parentNode.removeChild(form);
	var buttonDiv = document.getElementById("monster-add");
	buttonDiv.classList.remove("hidden");
}


function startInitEncounter() {
	npcs = {};
	var x = document.getElementById("init-encounter");
	x.innerHTML = "";
	var monsterInput = document.getElementById("monster-input").innerHTML;

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

function startRoll() {
	bcs = {};
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
			bcs[npc.name] = {name: npc.name, type: "Monster", health: npc.health, dex: npc.dex, initroll: roll.value};
			updateBCs();
			return false;
		});

		forms.appendChild(form);
	}());}
}

function cancelEncounter() {
	setState("home");
}

function startEncounter() {

}
