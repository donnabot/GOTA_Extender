var extender = {
    command: function (name, args) {
        var cmd = { name: name, args: args };
        $("textarea#observable").attr("command", JSON.stringify(cmd));
    },
    lastcommand: function () {
        var observable = $("textarea#observable");
        var lcmd = observable.attr("command");
        observable.val(lcmd);
        return lcmd;
    },
    option: function (option, val) {
        if (typeof option == "string") {
            this.command("option", [option, val]);
        } else {
            error("Please specify name and value as parameters.", "COMMAND");
        }
    }
};

var productionQueue = [];
function attemptProduction(bSymbol) {

    if (!productionQueue || productionQueue.length == 0) {
        log('Attempted production, but queue was missing or empty. Exiting...', "PRODUCTION");
        return;
    }

    if (typeof bSymbol != "undefined") {

        // Check this building for production
        var b = buildingBySymbol(bSymbol);

        if (buildingProducing(b)) {
            log("Building " + b.symbol + " is busy.", "PRODUCTION");
            return;
        }

        if (buildingFinished(b)) {
            log("Building " + b.symbol + " finished production.", "PRODUCTION");

            doFinishProduction(b.item_id, function() {
                attemptProduction(b.symbol);
            });

            return;
        }

        var element = getElement(b.symbol);
        if (element) {
            executeElement(element);
            return;
        }
    } else {

        for (var i = 0; i < userContext.buildingsData.length; i++) {
            var b = userContext.buildingsData[i];

            if (buildingProducing(b)) {
                log("Building " + b.symbol + " is busy.", "PRODUCTION");
                continue;
            }

            if (buildingFinished(b)) {
                log("Building " + b.symbol + " finished production.", "PRODUCTION");
                doFinishProduction(b.item_id, function() {
                    attemptProduction();
                });

                return;
            }

            var element = getElement(b.symbol);
            if (element) {
                executeElement(element, function () {
                    attemptProduction();
                });

                return;
            }
        }
    }
};

function getElement(buildingSymbol) {
    if (!productionQueue || productionQueue.length == 0) {
        log('Attempted to extract item from queue, but the production queue was missing or empty. Exiting...', "PRODUCTION");
        return null;
    }

    var element;

    for (var i = 0; i < productionQueue.length; i++) {

        if (productionQueue[i].activeBuildingPanel == buildingSymbol) {
            element = productionQueue[i];
            break;
        }
    }

    if (!element) {
        log('No elements enqueued for building ' + buildingSymbol + '. Array size: ' + productionQueue.length, "PRODUCTION");
        return null;
    }

    return element;
};

function executeElement(element, callback) {

    var index = productionQueue.indexOf(element);
    log('Production of element ' + element.name + ' : ' + element.type + ' with index ' + index + ' initiated.', "PRODUCTION");

    if (element.type == "item") {
        userContext.recipeData = element.recipeData;
        userContext.activeBuildingPanel = element.activeBuildingPanel;

        doProduction(element.outputSymbol, element.recipeCategory, null, null, element.recipeName, callback);
        productionQueue.splice(index, 1);

        log('Production details: ' + element.name + ' at ' + element.activeBuildingPanel + ', ' + element.outputSymbol + ', ' + element.recipeCategory + ', ' + element.recipeName + ';', "PRODUCTION");
    } else {

        var buildingId = buildingBySymbol(element.activeBuildingPanel).id;

        applySelectedUpgrade({ building_id: buildingId, id: element.upgradeId, gold: 0, silver: 0 }, null, callback);
        productionQueue.splice(index, 1);

        log('Production details: ' + element.name + ' : ' + element.type + ' at ' + element.activeBuildingPanel + ', ' + element.symbol + ';', "PRODUCTION");

    }
};

function buildingFinished(b) {

    // DO NOT call this function for the keep: it has neither build_remaining nor producing_archetype_id

    // When a building finished either producing or bonus archetype id's should be present along with
    // no build time remaining to safely determine that this building has produced the item (luck or not)
    // but has not finalized the production yet (that's clicking the finish button)
    // Note that upgrades also enlist with a producing_archetype_id here, so they behave similarly
    return (b.producing_archetype_id != void 0 || b.bonus_archetype_id != void 0) && b.build_remaining == void 0;
}

function buildingProducing(b) {

    // DO NOT call this function for the keep: it has neither build_remaining nor producing_archetype_id

    // Luck-based recipes do not assign producing_archetype_id property
    // for all others this returns the remaining build
    //return b.producing_archetype_id && b.build_remaining;

    // Simple and short, if this property is present and the value
    // is a positive number, then the building is still in production
    return b.build_remaining != void 0 && b.build_remaining > 0;
}

function updateBuildingTimer(b){
        
}

var bruteForceTimeout;
function bruteForce(enabled, times) {

    if (brutingImmediateTermination) {
        bruteForceTimeout = clearTimeout(bruteForceTimeout);

        msg = "Bruting terminated immediately.";
        log(msg, "BRUTING");
        inform(msg);
        return;
    }

    var msg;
    var container = $("#bruteBtn");
    if (!container || container.length == 0) {
        container = $(".challengerewardbox .rewarditem:last");
    }

    if (!container || container.length == 0) {
        container = $(".challengerewards .challengerewarditems:first");
    }

    if (!container || container.length == 0) {
        msg = "Cannot find appropriate container for messaging!";
        warn(msg);        
    }

    if (typeof enabled == "boolean" && !enabled) {
        bruteForceTimeout = clearTimeout(bruteForceTimeout);

        msg = "Bruting terminated.";
        log(msg, "BRUTING");

        //        console.debug("Debuging message delivery: is there a container? " + (container) + ", " +
        //            "what's his length: " + container.length + ", append message? " + (container && container.length > 0) + ", " +
        //            "and what's the message: " + msg);

        if (container.hasClass("btnwrap btnmed")) {
            container.find("a").text("Done!");
        }

        container.after("<br />" + msg);

        if (times === "all") {
            bruteSendAll();
        }

        return;
    }

    // Do not run if bruting is disabled (but can be viewed)
    if (extender_bruteWounds && extender_bruteWounds == 0) {

        msg = "Disabled. Please set a positive number of max wounds from options to continue.";
        warn(msg, "BRUTING");

        // console.debug("Debuging message delivery: is there a container? " + (container) + ", " +
        // "what's his length: " + container.length + ", append message? " + (container && container.length > 0) + ", " +
        // "and what's the message: " + msg);

        container.after("<br />" + msg);

        bruteForce(false, times);
        return;
    }

    var s = userContext.setSwornSword;

    if (!s) {
        msg = "Failed, no sworn sword set.";
        error(msg, "BRUTING");

        container.after("<br />" + msg);
        bruteForce(false, times);
        return;
    }

    // console.debug("Debuging sworn sword condition: s.damage: " + s.damage + ", " +
    // "extender_bruteWounds: " + extender_bruteWounds + ", do bruting? " + (s.damage < extender_bruteWounds));

    if (s.damage < extender_bruteWounds) {

        resolveModifier(s);

        var attack =
            extender_sendAllAction === "selected" && !(!userContext.currentActionLabel)
            ? userContext.currentActionLabel : s.modifier;

        // console.debug("Attack with: " + attack);
        if (times == "once") {
            doAdventure("", attack, false, function (failure) {
                bruteForce(false, times);
            });
        } else {            
            doAdventure("", attack, false, function (failure) {
                bruteForce(!failure, times);
            });
        }

        return;
    }

    if (times === "all" || extender_bruteSwitchOff) {

        msg = "Sworn sword recieved " + extender_bruteWounds + " wounds! Brute timer will self terminate.";
        warn(msg, "BRUTING");

        // console.debug("Debuging message delivery: is there a container? " + (container) + ", " +
        // "what's his length: " + container.length + ", append message? " + (container && container.length > 0) + ", " +
        // "and what's the message: " + msg);

        container.after("<br />" + msg);

        bruteForce(false, times);

    } else {

        // Add a minute to the cooldown, and then multiply by wounds
        var interval = extender_bruteWounds * (s.damage_cooldown + 60);
        msg = "Sworn sword recieved " + extender_bruteWounds + " wounds! " +
            "Brute timer will self adjust. Wait " + extender_bruteWounds + " * (" + s.damage_cooldown + " + 60) = " + interval + " seconds.";

        warn(msg, "BRUTING");

        bruteForceTimeout = setTimeout(function () {
            bruteForce(true, times);
        }, interval * 1000);

        // console.debug("Debuging message delivery: is there a container? " + (container) + ", " +
        // "what's his length: " + container.length + ", append message? " + (container && container.length > 0) + ", " +
        // "and what's the message: " + msg);

        container.after("<br />" + msg);
    }
};

function bruteSendAll() {
    var sw = getSwornSwords(extender_sendAllAction);
    console.debug("Sworn swords retrieved successfully...");

    for (var i = 0; i < sw.length; i++) {
        var ss = sw[i];

        if (typeof ss.not_on_adventure == "boolean" && ss.not_on_adventure)
            continue;

        if (ss.cooldown > 0 || ss.damage >= extender_bruteWounds) 
            continue;

        console.debug("Sending: " + ss.full_name);

        setSwornSword(ss.id);
        bruteForce(true, "all");
        return;
    }

    inform("All sworn swords have been bruted to maximum wounds.<br>Action: " + extender_sendAllAction);

}

var brutingImmediateTermination = false;
$(document).on("keyup", function (e) {
    if (e.keyCode == 27) {
        e.preventDefault();
        e.stopPropagation();

        brutingImmediateTermination = true;
        log("Attempting immediate bruting termination.");
    }
});

function increment(me) {
    var opt = $(me);

    var min = parseInt(opt.attr("min"));
    var max = parseInt(opt.attr("max"));
    var step = parseInt(opt.attr("step"));
    var val = parseInt(opt.text());

    if (isNaN(min) || isNaN(max) || isNaN(step) || isNaN(val)) {
        error("Parsing of attributes failed!", "number option");
        return;
    }

    var newVal = val + step > max ? min : val + step;
    opt.text(newVal);
};

function check(me) {
    $(me).toggleClass('checked');
};

function bruteSwitchToggle(me) {
    var bSwitch = $(me).find("a.btngold");
    bSwitch.text() == "switch off"
    ? bSwitch.text("adjust")
    : bSwitch.text("switch off");
};

function inputIncrement(me) {
    var input = $(me).parent().find("input[name='quantity']");
    if (!input || input.length == 0) {
        return;
    }

    var v = parseInt(input.val());
    var max = parseInt(input.attr("maxlength"));
    if (isNaN(v) || isNaN(max)) {
        return;
    }

    if (me.id == "excountup") {
        (max == 3 ? max = 999 : max = 99);
        (v + 1 > max ? v = max : v = v + 1);
    } else if (me.id == "excountdown") {
        (v - 1 < 0 ? v = 0 : v = v - 1);
    }

    input.val(v);
}

function sort(arr) {
    if (typeof arr == "undefined") {
        arr = playerInventory;
    }

    if (!(arr instanceof Array)) {
        error("Not an array! Sorting failed.");
        return arr;
    }
    
    // console.debug("Sorting of array initiated, check parameters: boons count: " + boons.length + ", " +
    // "sorting property: " + extender_boonsSortBy);

    arr.sort(function (a, b) {
        return b[extender_boonsSortBy2] - a[extender_boonsSortBy2];
    });

    arr.sort(function (a, b) {
        return b[extender_boonsSortBy] - a[extender_boonsSortBy];
    });

    log("Array sorted by " + extender_boonsSortBy + " and then by " + extender_boonsSortBy2 + " successfully.", "PAGE");
    return arr;

}

function sortShop(arr) {
    if (typeof arr == "undefined" || !(arr instanceof Array)) {
        error("Not an array. Please pass an array to be sorted.");
        return arr;
    }

     //console.debug("Sorting of array initiated, check array count: " + arr.length);    

    arr.sort(function(a, b) {

        //console.debug("Init first sorting, condition 1, properties exist: ", a.hasOwnProperty(extender_shopSortBy2), b.hasOwnProperty(extender_shopSortBy2));
        if (!a.hasOwnProperty(extender_shopSortBy2) || !b.hasOwnProperty(extender_shopSortBy2)) {
            return false;
        }        

        var aVal = a[extender_shopSortBy2];
        var bVal = b[extender_shopSortBy2];

        //console.debug("Logging property values: ", aVal, bVal);

        if (typeof aVal != "number" || typeof bVal != "number") {

            //console.debug("Values need parsing...");

            aVal = parseInt(aVal);
            bVal = parseInt(bVal);

            //console.debug("Parsed values: ", aVal, bVal);
            if (isNaN(aVal) || isNaN(bVal)) {
                return false;
            }
        }

        //console.debug("Sorting descending...");
        return bVal - aVal;
    });

    arr.sort(function (a, b) {

        //console.debug("Init second sorting, condition 1, properties exist: ", a.hasOwnProperty(extender_shopSortBy2), b.hasOwnProperty(extender_shopSortBy2));
        if (!a.hasOwnProperty(extender_shopSortBy) || !b.hasOwnProperty(extender_shopSortBy)) {
            return false;
        }
        
        var aVal = a[extender_shopSortBy];
        var bVal = b[extender_shopSortBy];

        //console.debug("Logging property values: ", aVal, bVal);

        if (typeof aVal != "number" || typeof bVal != "number") {

            //console.debug("Values need parsing...");

            aVal = parseInt(aVal);
            bVal = parseInt(bVal);

            //console.debug("Parsed values: ", aVal, bVal);
            if (isNaN(aVal) || isNaN(bVal)) {
                return false;
            }
            
        }

        //console.debug("Sorting descending...");
        return bVal - aVal;
    });

    // Array will always be sorted by gold, descending
    arr.sort(function (a, b) {
        return parseInt(a["price_perk_points"]) - parseInt(b["price_perk_points"]);
    });

    //console.debug("Sorted by gold: ");

    //arr.forEach(function (element) {
    //    console.debug(element["price_perk_points"]);
    //});

    log("Array sorted by " + extender_shopSortBy + " and then by " + extender_shopSortBy2 + " successfully.", "PAGE");
    return arr;

}

function formatStats(battle, trade, intrigue, level) {
    return '<div class="exstatbox">' +
        '<div id="plevel" class="statitem">' +
        '<div><span></span>' +
        '</div><var>' + level + '</var></div>' +
        '<div id="battle" class="statitem">' +
        '<div><span></span>' +
        '</div><var class="battle_val" id="battle_val">' + battle + '</var></div>' +
        '<div id="trade" class="statitem">' +
        '<div><span></span>' +
        '</div><var class="trade_val" id="trade_val">' + trade + '</var></div>' +
        '<div id="intrigue" class="statitem">' +
        '<div><span></span></div>' +
        '<var class="intrigue_val" id="intrigue_val">' + intrigue + '</var></div>' +
        '</div>';
}

function getSwornSwords(filter, garrison_region, garrison_subregion) {
    var ss = [];
    var pi = playerInventory;

    for (var i = 0; i < pi.length; i++) {
        var s = pi[i];

        if (s.slot !== "Sworn Sword")
            continue;

        if (!s.modifier) {
            resolveModifier(s);
        }

        if (typeof filter == "number" && !isNaN(filter) && s.id === filter) {
            return s;
        }

        if (typeof filter == "string" && !isNaN(parseInt(filter)) && s.id === parseInt(filter)) {
            return s;
        }

        if (typeof garrison_region != "undefined" && typeof garrison_subregion != "undefined" &&
            !isNaN(garrison_region) && !isNaN(garrison_subregion) && !checkGarrison(s, garrison_region, garrison_subregion))
            continue;        

        if (typeof filter == "string") {

            if (filter == "all" || filter == "selected") {
                ss.push(s);
                continue;

            } else if (filter == "none"){
                continue;
            }

            var friendlyActions = ["aid", "barter", "bribe"];
            var hostileActions = ["fight", "harass", "spy", "sabotage", "steal", "hoodwink"];

            var battleActions = ["fight", "harass", "aid"];
            var tradeActions = ["barter", "hoodwink", "bribe"];
            var intrigueActions = ["spy", "sabotage", "steal"];

            //if ((friendlyActions.indexOf(filter) > -1 || hostileActions.indexOf(filter) > -1) && s.modifier != filter) {
            //    continue;
            //}

            switch (filter) {
            case "battle":
            {
                if (battleActions.indexOf(s.modifier) == -1)
                    continue;
                else
                    break;
            }
            case "trade":
            {
                if (tradeActions.indexOf(s.modifier) == -1)
                    continue;
                else
                    break;
            }
            case "intrigue":
            {
                if (intrigueActions.indexOf(s.modifier) == -1)
                    continue;
                else
                    break;
            }
            case "friendly":
            {
                if (friendlyActions.indexOf(s.modifier) == -1)
                    continue;
                else
                    break;
            }
            case "hostile":
            {
                if (hostileActions.indexOf(s.modifier) == -1)
                    continue;
                else
                    break;
            }
            default:
                {
                    if (s.modifier != filter)
                        continue;
                    else
                        break;
                }
            }
        }

        ss.push(s);
    }

    return ss;
}

function checkGarrison(s, region, subregion) {
    if (typeof s.garrison_region == "undefined" || typeof s.garrison_subregion == "undefined" ||
        isNaN(s.garrison_region) && isNaN(s.garrison_subregion)) {
        return false;
    }

    if (s.garrison_region != region || s.garrison_subregion != subregion) {
        return false;
    }

    return true;
}

function setSwornSword(param) {
    if (typeof param == "undefined") {
        error("The function requires a sworn sword id as parameter.")
        return;
    }
        
    if (typeof param == "number") {
        var s = extractItemById(playerInventory, param);
        s && (userContext.setSwornSword = s);
    } else if (typeof param == "string") {
        var s = extractItemById(playerInventory, parseInt(param));
        s && (userContext.setSwornSword = s);
    } else if (typeof param == "object") {
        userContext.setSwornSword = param;
    }
}

function checkCommandPoints() {
    if(!userContext || !userContext.playerData || !userContext.playerData.stat)
        return false;

    var commandPoints = userContext.playerData.stat.command - userContext.playerData.stat.current_command;

    log("Debugging check command points: command points: " + commandPoints + ", " +
    "continue then? " + (!isNaN(commandPoints) && commandPoints > 0));

    return !isNaN(commandPoints) && commandPoints > 0;
}
function adventureSendAll(adventure, swornswords) {

    if (extender_sendAllAction === "none") {
        inform("This function is disabled. Please enable it from options.");
        return;
    }

    if(!checkCommandPoints()){
        inform("Not enough command points. <br>Action cannot execute.");
        return;
    }

    if (typeof swornswords == "undefined" || !(swornswords instanceof window.Array)) {
        error("An array should be passed to the function. Sending failed.");
        return;
    }

    if (typeof adventure != "string") {
        error("Adventure should be passed as a string. Sending failed.");
        return;
    }

    if (swornswords.length == 0) {
        inform('All sworn swords send on ' + adventure + '.<br>Action: ' + extender_sendAllAction);
        return;
    }

    var s = swornswords.pop();

    log("Debuging send all: swornswords: " + swornswords.length + ", " +
        "current: " + s.full_name + ", " +
        "cooldown: " + s.cooldown + ", " +
        "damage: " + s.damage + ", " +
        "send? " + !(s.cooldown > 0 || s.damage >= extender_bruteWounds));

    if(s.cooldown > 0 || s.damage >= extender_bruteWounds) {
        adventureSendAll(adventure, swornswords);
        return;
    }

    setSwornSword(s.id);

    if (!s.modifier) {
        resolveModifier(s);
    }

    var attack =
        extender_sendAllAction === "selected" && !(!userContext.currentActionLabel)
        ? userContext.currentActionLabel : s.modifier;

    doAdventure(adventure, attack, false, function (failure) {
        adventureSendAll(adventure, swornswords);
    });

}

var pvpFormStore;
function pvpSendBatch(swornswords) {
    if (extender_sendAllAction === "none") {
        inform("This function is disabled. Please enable it from options.");
        return;
    }

    if(!checkCommandPoints()){
        inform("Not enough command points. <br>Action cannot execute.");
        return;
    }

    if (typeof swornswords == "undefined" || !(swornswords instanceof window.Array)) {
        error("An array should be passed to the function. Sending failed.");
        return;
    }

    if (swornswords.length == 0) {
        inform("All sworn swords are now busy.<br>Action: " + extender_sendAllAction);        
        pvpFormStore = {};  // clear the store for further use
        return;
    }

    var s = swornswords.pop();

    log("Debuging send all: swornswords: " + swornswords.length + ", " +
        "current: " + s.full_name + ", " +
        "cooldown: " + s.cooldown + ", " +
        "damage: " + s.damage + ", " +
        "send? " + !(s.cooldown > 0 || s.damage >= extender_bruteWounds));

    if (s.cooldown > 0 || s.damage >= extender_bruteWounds) {
        pvpSendBatch(swornswords);
        return;
    }

    // Store the pvp or replace it
    // if it is stored already

    if (!pvpFormStore) {
        pvpFormStore = pvpForm;
    } else {
        pvpForm = pvpFormStore;
    }

    setSwornSword(s.id);

    if (!s.modifier) {
        resolveModifier(s);
    }

    if (extender_sendAllAction !== "selected") {
        userContext.currentActionLabel = s.modifier;
    }

    pvpLaunch(function(success) {
        pvpSendBatch(swornswords);
    });
}

function resolveModifier(s) {
    if (s.modifier) {           
		log("Modifier already set.");
		return;		
	}
	
    // Calculate what attack shoild we use if there ain't any
    var max = Math.max(s.calc_battle, s.calc_trade, s.calc_intrigue);
    if (max == s.calc_intrigue) {
        s.modifier = "spy";
    } else if (max == s.calc_trade) {
        s.modifier = "barter";
    } else {
        s.modifier = "fight";
    }
	
}

function avaSendBatch(swornswords) {
    if (extender_sendAllAction === "none") {
        inform("This function is disabled. Please enable it from options.");
        return;
    }

    if(!checkCommandPoints()){
        inform("Not enough command points. <br>Action cannot execute.");
        return;
    }


    if (typeof swornswords == "undefined" || !(swornswords instanceof window.Array)) {
        error("An array should be passed to the function. Sending failed.");
        return;
    }

    if (swornswords.length == 0) {
        inform("All sworn swords are now busy.<br>Action: " + extender_sendAllAction);
        return;
    }

    var s = swornswords.pop();

    console.debug("Debuging send all: swornswords: " + swornswords.length + ", " +
        "current: " + s.full_name + ", " +
        "id: " + s.id + ", " +
        "cooldown: " + s.cooldown + ", " +
        "damage: " + s.damage + ", " +
        "region: " + s.garrison_region + ", " +
        "subregion: " + s.garrison_subregion + ", " +
        "send? " + !(s.damage >= extender_bruteWounds));

    if (s.damage >= extender_bruteWounds) {
        avaSendBatch(swornswords);
        return;
    }

    itemCurrentSelection = s;

    if (extender_sendAllAction !== "selected") {
        userContext.currentActionLabel = s.modifier;
    }

    doCampAttack(userContext.campAttackData.id, "skip", function (r) {
        console.debug("Anonymous function parameter: ", r);

        if (r.error) {
            avaSendBatch(swornswords);
            return;
        }

        if (!r.camp_attack) {
            error("Camp data is missing, cannot create new attack.");
            return;
        }

        r = r.camp_attack;

        $.ajax({
            url: "/play/camp_attack_create?alliance_id=" + r.target_alliance_id + "&region=" + r.region + "&subregion=" + r.subregion + "&acnew=" + userContext.playerData.ac,
            dataType: "JSON",
            success: function(a) {
                userContext.camp_battle = a.battle;
                userContext.camp_trade = a.trade;
                userContext.camp_intrigue = a.intrigue;
                userContext.campAttackData = a;
                startCampAttack(userContext.campAttackData);

                avaSendBatch(swornswords);
            }
        });
    });
}

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    // Do we trust the sender of this message?
    if (event.origin !== "https://games.disruptorbeam.com") {
        error("Message from untrusted source was rejected.");
        console.debug(event);
        return;
    }

    //console.debug("Message recieved: ", event);
    console.log("Evaluated: ", eval(event.data));

}

function observable_onkeyup(e){
    if(e.keyCode !== 13)
        return true;

    var observable = $("textarea#observable");
    if (!observable) {
        error("The observable DOM element was not found in the page.");
        return false;
    }

    try {
        var cmd = observable.val().toString();
        eval("extender." + cmd);
    } catch(err) {
        var prefix = "COMMAND ACKNOWLEDGED" + " | " + new Date().toLocaleTimeString() + " | ";
        observable.val(prefix + err);
    }

    return false;
}