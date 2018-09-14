var socket = io();

var pcs = {};
var pcList = document.getElementById("list-pcs");
socket.emit("login-dm", {});
socket.on("send-pcs", function(data) {
	pcs = data;
	pcList.innerHTML = "";
	var table = document.getElementById("pc-table").children[0].cloneNode(true);
	var tbody = table.children[1];
	for (var id in pcs) {
		var pc = pcs[id];
		var row = document.createElement("tr");
		var name = document.createElement("td");
		name.innerHTML = pc["noteList"]["name"];
		row.appendChild(name);
		var c = document.createElement("td");
		c.innerHTML = pc["noteList"]["class"];
		row.appendChild(c);
		var health = document.createElement("td");
		health.innerHTML = pc["maxHealth"];
		row.appendChild(health);
		var dex = document.createElement("td");
		dex.innerHTML = pc["maxDex"];
		row.appendChild(dex);

		tbody.appendChild(row);
	}
	pcList.appendChild(table);
});

var npcs = {};
function updateMonsters() {
	var npcList = document.getElementById("list-npcs");
	npcList.innerHTML = "";
	var table = document.getElementById("npc-table").children[0].cloneNode(true);
	var tbody = table.children[1];
	for (var id in npcs) {
		var npc = npcs[id];
		var row = document.createElement("tr");
		var name = document.createElement("td");
		name.innerHTML = npc.name;
		row.appendChild(name);
		var health = document.createElement("td");
		health.innerHTML = npc.health;
		row.appendChild(health);
		var init = document.createElement("td");
		init.innerHTML = npc.init;
		row.appendChild(init);

		tbody.appendChild(row);
	}
	npcList.appendChild(table);
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
	var init = fields.querySelector("#monster-init").value;
	cancelMonster()
	if (name == "") return;
	addMonster({name: name, health: health, init: init});
}

function cancelMonster() {
	var form = document.getElementById("monster-form");
	form.parentNode.removeChild(form);
	var buttonDiv = document.getElementById("monster-add");
	buttonDiv.classList.remove("hidden");
}

var buttondr = document.getElementById("b-down-right");
var buttondl = document.getElementById("b-down-left");
function initEncounter() {
	var x = document.getElementById("init-encounter");
	var monsterInput = document.getElementById("monster-input").innerHTML;

	buttondr.value = "Start Battle";
	buttondr.removeEventListener("click", initEncounter);
	buttondr.addEventListener("click", startEncounter);

	buttondl.value = "Cancel";
	buttondl.addEventListener("click", cancelEncounter);

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
buttondr.addEventListener("click", initEncounter);

function cancelEncounter() {
	var x = document.getElementById("init-encounter");
	buttondr.value = "Init Battle";
	buttondr.removeEventListener("click", startEncounter);
	buttondr.addEventListener("click", initEncounter);
	npcs = {};
	x.innerHTML = "";
}

function startEncounter() {

}
