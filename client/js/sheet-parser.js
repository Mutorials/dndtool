function parseSheet(xml) {
	var sheet = {};
	tags.forEach(function(tag) {
		var res = xmlDoc.getElementsByTagName(tag)[0].innerHTML;
		if (res.includes("â ")) {
			res = res.split("â ");
			for (var i = 0; i < res.length; i++) {
				var e = res[i];
				if (e.includes("â¡")) {
					res[i] = e.split("â¡");
				}
			}
		}

		for (var subTag in subTags) {
			val = subTags[subTag];
			if (subTag == tag) {
				var temp = {};
				val.forEach(function(e, k){
					temp[e] = res[k];
				});
				res = temp;
			}
		}
		sheet[tag] = res;
	});
	return sheet;
}

var subTags = {
	"noteList": [
		"features", "armor-prof", "weapon-prof", "tool-prof",
		"languages", "equipment", "notes", "class", "race", "background", "alignment",
		"traits", "ideals", "bonds", "flaws",
		"name", "class2", "cp", "sp", "ep", "gp", "pp", "zero"
	],
	"abilityScores": [
		"str-score", "dex-score", "con-score", "int-score", "wis-score", "cha-score",
		"str-prof", "dex-prof", "con-prof", "int-prof", "wis-prof", "cha-prof",
		"str-bonus", "dex-bonus", "con-bonus", "int-bonus", "wis-bonus", "cha-bonus"
	]

}

var tags = [
	"version",
	"initMiscMod",
	"improvedInitiative",
	"currentHealth",
	"maxHealth",
	"currentTempHP",
	"armorBonus",
	"shieldBonus",
	"miscArmorBonus",
	"maxDex",
	"proficiencyBonus",
	"miscSpellAttackBonus",
	"miscSpellDCBonus",
	"castingStatCode",
	"offenseAbilityDisplay",
	"deathSaveSuccesses",
	"deathSaveFailures",
	"showDeathSaves",
	"baseSpeed",
	"speedMiscMod",
	"movementMode",
	"raceCode",
	"subraceCode",
	"backgroundCode",
	"pagePosition0",
	"pagePosition1",
	"pagePosition2",
	"pagePosition3",
	"pagePosition4",
	"unarmoredDefense",
	"classData",
	"weaponList",
	"abilityScores",
	"skillInfo",
	"spellList",
	"noteList",
	"hitDiceList",
	"classResource"
];

/*

*/
