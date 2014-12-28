// ==UserScript==
// @name        GOTA Extender
// @namespace   gota_extender
// @author      Panayot Ivanov
// @description Game of Thrones Ascent Extender
// @include     http://gota.disruptorbeam.com/*
// @include     http://gota-www.disruptorbeam.com/*
// @include     https://gota.disruptorbeam.com/*
// @include     https://gota-www.disruptorbeam.com/*
// @include     https://games.disruptorbeam.com/gamethrones/
// @exclude     http://gota.disruptorbeam.com/users/login*
// @exclude     http://gota-www.disruptorbeam.com/users/login*
// @license     WTFPL (more at http://www.wtfpl.net/)
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://greasyfork.org/scripts/5427-gota-extender-constants/code/GOTA_Extender_Constants.js?version=29418
// @require     https://greasyfork.org/scripts/5279-greasemonkey-supervalues/code/GreaseMonkey_SuperValues.js?version=20819
// @resource 	custom https://greasyfork.org/scripts/5426-gota-extender-custom/code/GOTA_Extender_Custom.js?version=29284
// @resource    auxiliary https://greasyfork.org/scripts/5618-gota-extender-auxiliary/code/GOTA_Extender_Auxiliary.js?version=29117
// @resource    original https://greasyfork.org/scripts/6702-gota-extender-original/code/GOTA_Extender_Original.js?version=29118
// @version     6.1.1
// @grant       unsafeWindow
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_openInTab
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// @grant       GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand("HOME", openHome);
function openHome() {
    GM_openInTab("https://greasyfork.org/en/scripts/3788-gota-extender");
}

GM_registerMenuCommand("DEBUG", enterDebugMode);
function enterDebugMode() {
    options.debugMode = true;
    options.set("debugMode");

    alert("Debug mode has been enabled. Extender will now reload.");
    window.location.reload(true);
}

GM_registerMenuCommand("CHECK", checkScript);
function checkScript() {
    options.checkScript = true;
    options.set("checkScript");

    alert("Extender will check for game function updates.\nPress OK to reload.");
    window.location.reload(true);
}

$ = this.$ = this.jQuery = jQuery.noConflict(true);

$(window).bind("load", function () {
    setTimeout(function () {
        initialize();
    }, ((options ? options.baseDelay : 4E3) / 2) * 1000);
});

// Observes DOM object mutations
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// Observers construction
var mainToolbarObserver = new MutationObserver(main_toolbar_buttons_changed);

// define what element should be observed by the observer
// and what types of mutations trigger the callback
mainToolbarObserver.observe(document.getElementById("main_toolbar_buttons"), {
    //	childList: true,
    attributes: true,
    //	characterData: true,
    subtree: true,
    attributeOldValue: true
    // if attributes
    //	characterDataOldValue: true,    // if characterData
    //	attributeFilter: ["id", "dir"], // if attributes
});

function main_toolbar_buttons_changed() {
    //    log("Mutation on main toolbar buttons.");

    var menu = $("#extender-menu");
    var container = $("#navmenubox");
    if (container.length > 0 && menu.length == 0) {
        container.append(templates.menuBtn);
    }
}

// --> Page command handling
var signalObserver = new MutationObserver(signal_acknowledged);
function signal_acknowledged() {
    var observable = $("textarea#observable");

    if (!observable) {
        error("The observable DOM element was not found in the page.");
        return;
    }

    var commandObj = JSON.parse(observable.attr("command"));
    if (!commandObj || typeof commandObj != "object") {
        error("Cannot parse the command object given.");
        return;
    }

    if (!commandObj.name || !commandObj.args) {
        error("Command does not define a name or arguments.");
        return;
    }

    var args = commandObj.args;

    // Parse command
    switch (commandObj.name) {
        case "option":
            //log("argument 1 = " + args[0] + ", " +
            //    "has own prop? " + (options.hasOwnProperty(args[0])) + ", " +
            //    "argument 2 = " + args[1], "DEBUG");

            if (options.hasOwnProperty(args[0]) && (typeof args[1] == "undefined" || !args[1])) {

                if (typeof options[args[0]] == "object") {
                    log(args[0] + " is a composite object:");
                    console.log(typeof cloneInto == "function" ? cloneInto(options[args[0]], unsafeWindow) : options[args[0]]);
                } else {
                    log(args[0] + ": " + options[args[0]]);
                }

                return;
            }

            if (options.hasOwnProperty(args[0]) && typeof options[args[0]] === typeof args[1]) {
                options[args[0]] = args[1];
                options.set(args[0]);
                log("Option set.");
                return;
            }

            warn("Lack of or incorrect parameters passed to command.");
            break;
        default:
            error("Unknown command.");
            break;
    }
}
// <-- Page command handling

// --> Initizalization
function initialize() {

    // Add global styles
    styles.addAllStyles();

    // Get all GM values
    options.get();

    try {

        if (options.checkScript) {

            checkSource();

            options.checkScript = false;
            options.set("checkScript");
            window.location.reload(true);
            return;
        }

        // Clean up GOTA shit...
        console.clear();

        // Try an injection sequence        
        inject.observable();
        inject.constants();
        inject.console();

        // Inject auxiliary code
        inject.code(GM_getResourceText("custom"));
        inject.code(GM_getResourceText("auxiliary"));

    } catch (e) {
        error("Fatal error, injection failed: " + e);
        inform("Fatal error, injection failed: " + e);
        return;
    }

    try {

        // Toggle
        toggleAll();

        // Claim
        quarterMasterDo();

        // If extender reloaded automatically, load queue
        if (options.productionQueue && options.productionQueue.length > 0) {
            loadProductionQueue();
        }

        // Store all sworn swords
        getSwornSwords();

        // Sort player inventory
        unsafeWindow.sort();

        log('Initialized. Happy hacking.');
        inform("Initialized.");


    } catch (e) {
        error("Fatal error, initialization failed: " + e);
        inform("Fatal error, initialization failed: " + e);
        return;
    }

}
// <-- Initizalization

// --> Options object
var options = {
    swornSwords: [],
    default_swornSwords: [],

    productionQueue: [],
    default_productionQueue: [],

    debugMode: true,
    default_debugMode: true,
    checkScript: false,
    default_checkScript: false,
    baseDelay: 4,
    default_baseDelay: 4,
    queueDelay: 4,
    default_queueDelay: 4,
    autoCollectInterval: 60,
    default_autoCollectInterval: 60,
    superiorMaterials: true,
    default_superiorMaterials: true,
    queueTimerInterval: 30,
    default_queueTimerInterval: 30,
    allowBruting: true,
    default_allowBruting: true,
    bruteWounds: 1,
    default_bruteWounds: 1,
    bruteSwitchOff: true,
    default_bruteSwitchOff: true,
    doTooltips: false,
    default_doTooltips: false,
    neverSpendGold: true,
    default_neverSpendGold: true,
    autoReloadInterval: 6,
    default_autoReloadInterval: 6,
    boonsSortBy: "available_quantity",
    default_boonsSortBy: "available_quantity",
    boonsSortBy2: "rarity",
    default_boonsSortBy2: "rarity",
    shopSortBy: "price",
    default_shopSortBy: "price",
    shopSortBy2: "rarity",
    default_shopSortBy2: "rarity",
    sendAllAction: "friendly",
    default_sendAllAction: "friendly",
    autoBossChallenge: false,
    default_autoBossChallenge: false,

    get: function () {
        var prefix = "";

        // Separate variable retrieval for both hosts
        if (unsafeWindow.location.host === "gota-www.disruptorbeam.com") {
            prefix = "gota-";
        }

        for (var property in this) {
            if (this.hasOwnProperty(property) && property.indexOf("default_") == -1 && typeof this[property] != "function") {
                // console.debug("Retirevieng " + prefix + property + " with default value of " + this["default_" + property]);

                this[property] = GM_SuperValue.get(prefix + property, this["default_" + property]);

                // console.debug("Property " + property + " has a value of " + this[property]);
            }
        }
    },

    set: function (opt) {

        var prefix = "";
        // Separate variable set for both hosts
        if (unsafeWindow.location.host === "gota-www.disruptorbeam.com") {
            prefix = "gota-";
        }

        if (opt && this.hasOwnProperty(opt)) {
            GM_SuperValue.set(prefix + opt, this[opt]);
            return;
        }

        var newValues = [];

        // Store property values in array
        for (var newProperty in this) {
            if (newProperty.indexOf("default_") > -1)
                continue;

            if (this.hasOwnProperty(newProperty) && typeof this[newProperty] != "function") {
                newValues.push(this[newProperty]);
            }
        }

        // console.debug(newValues);

        // Revert
        this.get();

        var i = 0;

        // Detect and change if necessary
        for (var oldProperty in this) {
            if (oldProperty.indexOf("default_") > -1)
                continue;

            if (this.hasOwnProperty(oldProperty) && typeof this[oldProperty] != "function" && this[oldProperty] != newValues[i]) {
                // console.debug("Setting property " + oldProperty + " with old value of " + this[oldProperty] + " to the new value of " + newValues[i]);

                GM_SuperValue.set(prefix + oldProperty, newValues[i]);
                this[oldProperty] = newValues[i];
            }

            i++;
        }
    },

    reset: function () {
        for (var property in this) {
            if (this.hasOwnProperty(property) && property.indexOf("default_") == -1 && typeof this[property] != "function") {
                this[property] = this["default_" + property];
            }
        }

        this.set();
    }
};
// <-- Options object

// --> Inject object
var inject = {

    // Constants required by the page
    constants: function () {

        // Safe string
        unsafeWindow.phraseText.shop_filter_extender = "Extender";

        // EXTENDER :: Modification - add custom filter
        if (unsafeWindow.shopFilters.indexOf("extender") == -1) {
            log("Injecting extender filter...");
            unsafeWindow.shopFilters.push("extender");
        }

        // Inject structured clone (for Mozilla)
        if (typeof (cloneInto) == "function") {
            unsafeWindow.extender_queueDelay = cloneInto(options.queueDelay, unsafeWindow);
            unsafeWindow.extender_confirmSuperiorMaterials = cloneInto(options.superiorMaterials, unsafeWindow);
            unsafeWindow.extender_bruteWounds = cloneInto(options.bruteWounds, unsafeWindow);
            unsafeWindow.extender_bruteSwitchOff = cloneInto(options.bruteSwitchOff, unsafeWindow);
            unsafeWindow.extender_debugMode = cloneInto(options.debugMode, unsafeWindow);
            unsafeWindow.extender_baseDelay = cloneInto(options.baseDelay, unsafeWindow);
            unsafeWindow.extender_neverSpendGold = cloneInto(options.neverSpendGold, unsafeWindow);

            unsafeWindow.extender_boonsSortBy = cloneInto(options.boonsSortBy, unsafeWindow);
            unsafeWindow.extender_boonsSortBy2 = cloneInto(options.boonsSortBy2, unsafeWindow);
            unsafeWindow.extender_shopSortBy = cloneInto(options.shopSortBy, unsafeWindow);
            unsafeWindow.extender_shopSortBy2 = cloneInto(options.shopSortBy2, unsafeWindow);

            unsafeWindow.extender_sendAllAction = cloneInto(options.sendAllAction, unsafeWindow);
            unsafeWindow.extender_autoBossChallenge = cloneInto(options.autoBossChallenge, unsafeWindow);

            unsafeWindow.userContext.tooltipsEnabled = cloneInto(options.doTooltips, unsafeWindow);

        } else {
            unsafeWindow.extender_queueDelay = options.queueDelay;
            unsafeWindow.extender_confirmSuperiorMaterials = options.superiorMaterials;
            unsafeWindow.extender_bruteWounds = options.bruteWounds;
            unsafeWindow.extender_bruteSwitchOff = options.bruteSwitchOff;
            unsafeWindow.extender_debugMode = options.debugMode;
            unsafeWindow.extender_baseDelay = options.baseDelay;
            unsafeWindow.extender_neverSpendGold = options.neverSpendGold;

            unsafeWindow.extender_boonsSortBy = options.boonsSortBy;
            unsafeWindow.extender_boonsSortBy2 = options.boonsSortBy2;
            unsafeWindow.extender_shopSortBy = options.shopSortBy;
            unsafeWindow.extender_shopSortBy2 = options.shopSortBy2;

            unsafeWindow.extender_sendAllAction = options.sendAllAction;
            unsafeWindow.extender_autoBossChallenge = options.autoBossChallenge;

            unsafeWindow.userContext.tooltipsEnabled = options.doTooltips;
        }

        log("Constants injected successfully.");
    },

    // Inject code
    code: function (code) {

        var script = document.createElement('script');
        script.type = "text/javascript";
        script.innerHTML = code;
        document.head.appendChild(script);

        log("Code injected successfully.");
    },

    outSource: function (src, delay) {

        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = src;

        delay ? setTimeout(function () {
            document.head.appendChild(script);
        }, (options.baseDelay / 4) * 1000) : document.head.appendChild(script);
    },

    // Injects a DOM object and starts observing it
    observable: function () {

        $("div#outerwrap div.footer").prepend(templates.observable);
        signalObserver.observe(document.getElementById("observable"), {
            //	childList: true,
            attributes: true,
            //	characterData: true,
            //  subtree: true,
            attributeOldValue: true
            // if attributes
            //	characterDataOldValue: true,    // if characterData
            //	attributeFilter: ["id", "dir"], // if attributes
        });

        log("Observable injected successfully.");
    },

    // Inject console and alert handling separately once
    console: function () {
        if (typeof exportFunction == "function") {
            exportFunction(log, unsafeWindow, {defineAs: "log"});
            exportFunction(warn, unsafeWindow, {defineAs: "warn"});
            exportFunction(error, unsafeWindow, {defineAs: "error"});

            exportFunction(inform, unsafeWindow, {defineAs: "inform"});

        } else {
            unsafeWindow.log = log;
            unsafeWindow.warn = warn;
            unsafeWindow.error = error;

            unsafeWindow.inform = inform;
        }

        log("Messaging system injected successfully.");
    }
};
// <-- Inject object

// --> Message handling
function log(message, type) {
    if (options && options.debugMode && console && console.log
        && typeof (console.log) == "function") {
        if (!type)
            type = "extender";

        var prefix = type.toString().toUpperCase() + " <" + new Date().toLocaleTimeString() + "> ";
        console.log(prefix + message);
    }
}

function error(message, type) {
    if (console && console.error && typeof (console.error) == "function") {
        if (!type)
            type = "extender";

        var prefix = type.toString().toUpperCase() + " - ERROR <" + new Date().toLocaleTimeString() + "> ";
        console.error(prefix + message);
    }
}

function warn(message, type) {
    if (console && console.warn && typeof (console.warn) == "function") {
        if (!type)
            type = "extender";

        var prefix = type.toString().toUpperCase() + " - WARNING <" + new Date().toLocaleTimeString() + "> ";
        console.warn(prefix + message);
    }
}

function inform(msg) {

    if (unsafeWindow && typeof unsafeWindow.doAlert == "function") {
        unsafeWindow.doAlert("EXTENDER", templates.formatMessage(msg));

        //$("div#modals_container_high div#modalwrap div#exalert")
        //    .parents("div.alertboxinner").css("min-height", "0")
        //    .parent("div.alertbox").css("min-height", "0")
        //    .parent("div.alertcontents").css("min-height", "0");

    } else if (alert && typeof alert == "function")
        alert(msg);
}
// <-- Message handling

$("#building_items").on('click', ".unlocked", upgradetab_opened);
function upgradetab_opened() {
    //    log("Building info & upgrades.");

    var btn = $("#upgradeQueue");
    var container = $("#selected_upgrade");
    if (container.length > 0 && btn.length == 0) {
        container.append(templates.queueUpgradeBtn);
    }
}

$("#modal_dialogs_top").on('click', ".buildingupgradetree .upgradeicon", upgradetab_changed);
function upgradetab_changed() {
    //    log('Upgrade description changed.');

    var btn = $("#upgradeQueue");
    var container = $("#selected_upgrade");
    if (container.length > 0 && btn.length == 0) {
        container.append(templates.queueUpgradeBtn);
    }
}

$("#modal_dialogs_top").on('click', ".production .productionrow", productiontab_onchange);
function productiontab_onchange() {
    //    log('Production view changed.');

    var btns = $(".production .craftbox .statviewbtm:visible .btnwrap.btnmed.equipbtn.queue:visible");
    var container = $(".production .craftbox .statviewbtm:visible");
    if (container.length > 0 && btns.length == 0) {
        container.prepend(templates.queue5Btn);
        container.prepend(templates.queueBtn);
    }
}

// --> Loops handling
function toggleAll() {
    toggleAutoCollect();
    toggleQueueTimer();
    toggleReloadWindow();
}

var autoCollectLoop;
function toggleAutoCollect() {
    if (options.autoCollectInterval > 0) {
        autoCollectLoop = setInterval(collectTax, options.autoCollectInterval * 60 * 1000);
        log("Auto collect loop set to: " + options.autoCollectInterval + "min.");
    } else {
        autoCollectLoop = clearInterval(autoCollectLoop);
        log("Auto collect loop disabled.");
    }
}

var queueTimer;
function toggleQueueTimer() {
    if (options.queueTimerInterval > 0) {
        queueTimer = setInterval(unsafeWindow.attemptProduction, options.queueTimerInterval * 60 * 1000);
        log("Queue timer interval set to: " + options.queueTimerInterval + "min.");
    } else {
        queueTimer = clearInterval(queueTimer);
        log("Queue timer disabled.");
    }
}

var reloadWindowTimeout;
function toggleReloadWindow() {
    if (options.autoReloadInterval > 0) {
        setTimeout(function () {
            saveProductionQueue();
            window.location.reload(true);
        }, options.autoReloadInterval * 60 * 60 * 1000);
        log("Auto reload interval set to: " + options.autoReloadInterval + "h.");
    } else {
        reloadWindowTimeout = clearTimeout(reloadWindowTimeout);
        log("Auto reloading cancelled.");
    }

}

function quarterMasterDo(status) {

    if (!status) {
        ajax({
            url: "/play/quartermaster_status",
            success: function (response) {
                quarterMasterDo(response);
            }
        });

        return;
    }

    if (status.total_keys) {
        openBox();
        return;
    }

    if (status.available_daily_key) {
        claimDailyQuarterMaster();
        return;
    }

    if (status.available_bonus_key) {
        claimBonusQuarterMaster();
        return;
    }

    log("All quartermaster rewards have been taken.");

    unsafeWindow.claimDaily();
    log("Daily reward claimed.")
}

function claimDailyQuarterMaster() {

    ajax({
        url: "/play/quartermaster_claim_daily",
        success: function (r) {
            quarterMasterDo(r.status);
        }
    });
}

function claimBonusQuarterMaster() {

    ajax({
        url: "/play/quartermaster_claim_bonus",
        success: function (r) {
            quarterMasterDo(r.status);
        }
    });
}

function openBox() {
    ajax({
        url: "/play/quartermaster_open_chest/?bribes=0&nonce=" + unsafeWindow.userContext.purchase_nonce,
        success: function (r) {
            unsafeWindow.userContext.purchase_nonce = r.purchase_nonce;
            log("Quartermaster opened a reward box. Rewards:")
            console.debug(r.rewards);

            quarterMasterDo();
        }
    });
}

function collectTax() {
    try {

        var itemId = unsafeWindow.buildingBySymbol('counting_house').item_id;
        unsafeWindow.doCollect(itemId);
        log("Silver collected.");

    } catch (err) {
        error(err);
        return;
    }
}
// <-- Loops handling

// --> Settings handling
$("#main_toolbar_buttons").on('click', "#extender-menu", showSettings);
function showSettings(e) {
    e.preventDefault();

    try {

        $("#credits_page").empty();
        $("#credits_page").append(templates.optionsHeader);
        $("#extenderTabMenu .charactertabs").append(templates.optionsTab("mainTab", "MAIN"));
        $("#extenderTabMenu .charactertabs").append(templates.optionsTab("queueTab", "QUEUE"));

        if (options.allowBruting) {
            $("#extenderTabMenu .charactertabs").append(templates.optionsTab("bruteTab", "BRUTING"));
        }

        $("#credits_page").append(templates.tabContent);
        $("#mainTab").trigger('click');
        optionsBottom();

        $("#credits_roll").show();

    } catch (err) {
        error(err);
        return;
    }
}

function optionsBottom() {
    var saveBtn = $("#saveOptions");
    var container = $("#creditsclose");
    if (saveBtn.length == 0 && container.length > 0) {
        container.before(templates.saveOptionsBtn);
    }

    $("#creditsclose").attr('onclick', '(function(){ $("#credits_page").empty(); $("#credits_roll").hide(); })()');

    var resetBtn = $("#resetOptions");
    if (resetBtn.length == 0 && container.length > 0) {
        container.after(templates.resetOptionsBtn);
    }

    $("resetOptions").append('<div class="barbtmedge"></div>');
}

$("#credits_roll").on("click", ".inventorytabwrap", tab_onchange);
function tab_onchange(e) {
    e.preventDefault();

    $(".inventorytab.active").removeClass("active");
    $(this).find(".inventorytab").addClass("active");

    switch (this.id) {
        case "mainTab":
            $("#extenderTabContent").html(templates.mainTab(options));
            break;
        case "queueTab":
            $("#extenderTabContent").html(templates.queueTab(options));
            renderProductionItems();
            break;
        case "bruteTab":
            getSwornSwords();
            $("#extenderTabContent").html(templates.bruteTab(options));
            break;
        default:
            break;
    }
}

function renderProductionItems() {

    var qTable = $("#queueTable");
    if (qTable.length == 0) {
        error("Can't find queue table! Rendering production items failed.");
        return;
    }

    // Clear table from any rows first
    $("#queueTable .tableRow").each(function () {
        $(this).remove();
    });

    var queue = unsafeWindow.productionQueue;
    if (!queue || queue.length == 0) {
        log("No queue was found to render.");
        return;
    }

    // Render items
    for (var i = 0; i < queue.length; i++) {
        $("#headerRow").after(templates.tableRow(i, queue[i]));
    }

    log("Production queue rendered " + queue.length + " items.");
}
// <-- Settings handling

$("#modal_dialogs_top").on('click', '#incomingtab', wireEvents);
function wireEvents(e) {
    e.preventDefault();

    window.setTimeout(function () {
        GM_xmlhttpRequest({
            method: "GET",
            url: "/play/incoming_attacks",
            onload: function (response) {
                try {
                    var a = JSON.parse(response.responseText);
                    // console.debug(response, a);
                    $('div.perkscroll div.achiev-content').each(function () {
                        var id = /[0-9]+/.exec($(this).find('div.increspond').attr('onclick'));

                        var attack = a.attacks.filter(function (e) {
                            return e.camp_attack_id === null ? e.pvp_id == id : e.camp_attack_id == id;
                        })[0];

                        if (!attack)
                            return;

                        $(this).find("span.charname").attr("onclick", "return characterMainModal(" + attack.attacker.user_id + ")");
                        $(this).find("span.charportrait").attr("onclick", "return characterMainModal(" + attack.attacker.user_id + ")");
                        $(this).find("span.targetalliancename").attr("onclick", "return allianceInfo(" + attack.alliance_id + ")");
                    });
                } catch (e) {
                    error(e);
                }

            }
        });
    }, (options.baseDelay / 2) * 1000);
}

$("#credits_roll").on('click', "#saveOptions", saveOptions_click);
function saveOptions_click(e) {
    e.preventDefault();

    try {

        var tab = $(".inventorytab.active:visible").parents(".inventorytabwrap").attr("id");

        switch (tab) {
            case "mainTab":
                saveMainTab();
                break;
            case "queueTab":
                saveQueueTab();
                break;
            case "bruteTab":
                saveBruteTab();
                break;

            default:
                return;
        }

        //options.set();
        //inject.constants();
        //unsafeWindow.sort();
        //toggleAll();

        $("#credits_page").empty();
        $("#credits_roll").hide();
        inform("Settings saved.");

    } catch (e) {
        inform(e);
    }
}

function saveMainTab() {
    if ($("#credits_roll").is(":hidden")) {
        return;
    }

    var bd = parseInt($("#baseDelay").text());
    if (!isNaN(bd) && options.baseDelay != bd) {
        options.baseDelay = bd;
    }

    options.debugMode = $("#toggleDebugModes").hasClass("checked");
    options.doTooltips = $("#toggleTooltips").hasClass("checked");
    options.neverSpendGold = $("#neverSpendGold").hasClass("checked");
    options.autoBossChallenge = $("#autoBossChallenge").hasClass("checked");


    var ari = parseInt($("#autoReloadInterval").val());
    if (!isNaN(ari) && options.autoReloadInterval !== ari) {
        options.autoReloadInterval = ari;
        toggleReloadWindow();
    }

    var aci = parseInt($("#autoCollectInterval").val());
    if (!isNaN(aci) && options.autoCollectInterval !== aci) {
        options.autoCollectInterval = aci;
        toggleAutoCollect();
    }

    options.boonsSortBy = $("#boonsSortBy").val();
    options.boonsSortBy2 = $("#boonsSortBy2").val();

    options.shopSortBy = $("#shopSortBy").val();
    options.shopSortBy2 = $("#shopSortBy2").val();

    options.sendAllAction = $("#sendAllAction").val();

    options.set();
    inject.constants();
    unsafeWindow.sort();
}

function saveQueueTab() {
    if ($("#credits_roll").is(":hidden")) {
        return;
    }

    options.superiorMaterials = $("#toggleSuperiorMaterials").hasClass("checked");

    var qd = parseInt($("#queueDelay").text());
    if (!isNaN(qd) && options.queueDelay !== qd) {
        options.queueDelay = qd;
    }

    var qti = parseInt($("#queueTimerInterval").val());
    if (!isNaN(qti) && options.queueTimerInterval !== qti) {
        options.queueTimerInterval = qti;
        toggleQueueTimer();
    }

    saveProductionQueue();

    options.set();
    inject.constants();
    //unsafeWindow.sort();
}

function saveBruteTab() {
    if ($("#credits_roll").is(":hidden")) {
        return;
    }

    var bWounds = parseInt($("#bruteWounds").text());
    if (!isNaN(bWounds)) {
        options.bruteWounds = bWounds;
    }

    var bSwitch = $("#bruteSwitchOff").find("a.btngold");
    options.bruteSwitchOff = bSwitch.text() == "switch off";

    options.set();
    inject.constants();
    //unsafeWindow.sort();
}

$("#credits_roll").on('click', "#resetOptions", resetOptions_click);
function resetOptions_click(e) {
    e.preventDefault();

    options.reset();
    inject.constants();
    unsafeWindow.sort();
    toggleAll();

    $("#credits_page").empty();
    $("#credits_roll").hide();
    inform("Options reset.");
}

$("#modal_dialogs_top").on('click', '#upgradeQueue', queue_clicked);
$("#modal_dialogs_top").on('click', 'span.btnwrap.btnmed.equipbtn.queue', queue_clicked);

function queue_clicked(e) {
    e.preventDefault();

    try {
        var queueingUpgrade = $(this).hasClass('upgradeQueue');
        log("Queing " + (queueingUpgrade ? "upgrade." : "item(s)."));

        if (queueingUpgrade) {

            var container = $(this).parents('div#selected_upgrade');
            var name = $(container).find('h5:first').text();

            var infoBtm = $(this).parents('div.buildinginfobtm');
            var func = $(infoBtm).find('.upgradeicon.active').attr('onclick');
            var upgradeImg = $(infoBtm).find('.upgradeicon.active .upgradeiconart img').attr('src');

            if (func.indexOf("clickSelectUpgrade") == -1) {
                error("Cannot resolve upgrade id.");
                return;
            }

            // TODO: Improve...
            // "return clickSelectUpgrade('7', 'balcony');"
            var symbol = func.split("'")[3];
            log("Selected " + symbol + " upgrade. Retrieve successfull.");

            var upgradeId;

            var buildingUpgrades = unsafeWindow.buildingUpgrades[unsafeWindow.userContext.activeBuildingPanel];
            for (var j = 0; j < buildingUpgrades.length; j++) {
                if (buildingUpgrades[j].symbol == symbol) {
                    upgradeId = buildingUpgrades[j].id;
                    break;
                }
            }

            if (!upgradeId) {
                error("Fatal error, cannot resolve upgrade id.");
                return;
            }

            log("Upgrade id resolved: " + upgradeId);

            var upgrade = {
                "name": name,
                "upgradeId": upgradeId,
                "type": "upgrade",
                "symbol": symbol,
                "img": upgradeImg,
                "activeBuildingPanel": unsafeWindow.userContext.activeBuildingPanel
            };

            // Insert the element into the queueArray (cloneInto for Mozilla)
            if (typeof cloneInto == "function") {
                var upgradeClone = cloneInto(upgrade, unsafeWindow);
                unsafeWindow.productionQueue.push(upgradeClone);
            } else {
                unsafeWindow.productionQueue.push(upgrade);
            }

            log("Pushed upgrade to queue.");

        } else {

            // Extract and construct object
            var statview = $(this).parents(".statview");
            var imgSrc = $(statview).find("div.statviewimg img").attr('src');

            if (typeof (imgSrc) == "undefined") {
                imgSrc = $(statview).find("span.iconview img").attr('src');
            }

            var statViewName = $(statview).find(".statviewname h3").text();
            var quantity = $(this).attr("data-quantity");

            // Extract variables needed
            var recipeName;

            var source = unsafeWindow.userContext.productionItemsClick[unsafeWindow.userContext.currentProductionItem];

            if (!source) {
                error('Failed to extract source production item.');
                return;
            }

            for (var i = 0; i < unsafeWindow.userContext.recipeData.length; i++) {
                var r = unsafeWindow.userContext.recipeData[i];
                if (r.output == source.outputSymbol) {
                    recipeName = r.symbol;
                    break;
                }

                if (r.success_loot_table && r.success_loot_table == source.outputSymbol) {
                    recipeName = r.symbol;
                    break;
                }

                if (r.success_loot_item && r.success_loot_item == source.outputSymbol) {
                    recipeName = r.symbol;
                    break;
                }
            }

            // Last attempt, these here are expensive operations
            if (!recipeName) {
                for (var i = 0; i < unsafeWindow.userContext.recipeData.length; i++) {
                    var r = unsafeWindow.userContext.recipeData[i];
                    var recipeInputs = JSON.stringify(r.input.split(","));
                    if (JSON.stringify(source.recipeInputs) === recipeInputs) {
                        recipeName = r.symbol;
                        break;
                    }
                }
            }
            if (!recipeName) {
                error('Failed to extract recipeName.');
                return;
            }

            log('All needed variables were extracted.');

            do {

                // Construct production element
                var element = {
                    "recipeName": recipeName,
                    "name": statViewName,
                    "img": imgSrc,
                    "type": "item",
                    "outputSymbol": source.outputSymbol,
                    "recipeCategory": source.recipeCategory,
                    "recipeData": unsafeWindow.userContext.recipeData,
                    "activeBuildingPanel": unsafeWindow.userContext.activeBuildingPanel
                };

                // Insert the element into the queueArray (cloneInto for Mozilla)
                if (typeof (cloneInto) == "function") {
                    var elementClone = cloneInto(element, unsafeWindow);
                    unsafeWindow.productionQueue.push(elementClone);
                } else {
                    unsafeWindow.productionQueue.push(element);
                }

                quantity--;

                log('Pushed element to queue.');

            } while (quantity > 0);
        }

        log('Attempting immediate production...');
        unsafeWindow.attemptProduction(unsafeWindow.userContext.activeBuildingPanel);
        inform('Enqueued.');

    } catch (err) {
        error(err);
    }
}

$("#credits_roll").on('click', '.tableRow', deleteTableRow);
function deleteTableRow(e) {
    e.preventDefault();

    try {
        var index = $(this).find("td:first span.ranklist").text();

        log("Attempting to delete element with index " + index + " from the queue array.");

        if (unsafeWindow.productionQueue.length == 1) {
            unsafeWindow.productionQueue.pop();
        } else {
            unsafeWindow.productionQueue.splice(index, 1);
        }

        renderProductionItems();

    } catch (err) {
        error(err);
    }

}

//--> Brute force adventure
$("#modal_dialogs_top").on("click", "#speedupbtn", viewAdventure_onclick);
function viewAdventure_onclick() {
    log("View adventure details.");

    var vBtn = $(this).find("a.btngold");
    if (!vBtn || vBtn.text() != "View Results!" || !options.allowBruting) {
        return;
    }

    setTimeout(function () {

        var btn = $("#bruteBtn");
        var container = $(".challengerewards .challengerewarditems:first");
        if (container.length > 0 && btn.length == 0) {
            container.after(templates.bruteBtn);
        }
    }, (options.baseDelay / 2) * 1000);
}

$("#quests_container").on("click", "span#bruteBtn.btnwrap.btnmed", brute_onclick);
$("#credits_roll").on("click", "span#bruteBtn.btnwrap.btnmed", brute_onclick);
$("#credits_roll").on("click", "span#bruteAllBtn.btnwrap.btnmed", brute_onclick);

function brute_onclick() {
    //    log("Brute!");

    // Save settings first
    saveBruteTab();

    // Find button text
    var b = $(this).find("a.btngold");

    if (!b || b.length == 0) {
        warn("Cannot find brute button!");
    }

    if (!options.allowBruting) {
        error("Bruting is not allowed.");
        return;
    }

    unsafeWindow.brutingImmediateTermination = false;
    b.text("Bruting...");

    if (this.id == "bruteAllBtn") {
        // Brute all sworn swords adventure...
        unsafeWindow.bruteSendAll();
    } else {
        // Else, brute adventure...
        unsafeWindow.bruteForce(true);
    }

}
// <-- Brute force adventure

// --> Bulk sell
$("#modal_dialogs").on("click", "#shop_miniview .offersitem.paginated_sellitem .miniview", sellitem_onchange);
function sellitem_onchange() {
    //    log("Item for sale changed");
    var itemId = this.id.replace("item_mini_", "");

    setTimeout(function () {

        var btn = $("#do_sell_bulk");
        var container = $("#modal_dialogs #statview_container_right .statviewbtm:first");
        if (container.length > 0 && btn.length == 0) {
            container.append(templates.sellBulkBtn(itemId));
        }
    }, 1000);
}

var amount;
var amountOwned;

$("#modal_dialogs").on("click", "#do_sell_bulk", bulkSell_onclick);
function bulkSell_onclick() {
    var amountInput = $("#sell_bulk_amount");
    if (!amountInput) {
        error("Cannot find the input for the sale amoun!");
        return;
    }

    amount = null;
    amountOwned = null;

    amount = parseInt(amountInput.val());
    if (!amount || isNaN(amount)) {
        error("Failed to parse amount of items to be sold.");

        amountInput.val("");
        amountInput.attr("placeholder", "Invalid...");
        return;
    }

    var parent = $(this).parents("div.statviewbtm");
    var ownedHtml = parent.children("p.itemowned").html();

    amountOwned = parseInt(ownedHtml.replace("Owned: ", ""));
    if (!amountOwned || isNaN(amountOwned)) {
        error("Failed to parse amount of owned items.");

        amountInput.val("");
        amountInput.attr("placeholder", "Error!");
        return;
    }

    var itemId = $(this).attr("item-id");
    if (!itemId) {
        error("Cannot resolve item id!");

        amountInput.val("");
        amountInput.attr("placeholder", "Error!");
        return;
    }

    if (0 >= amount) {
        amountInput.val("");
        amountInput.attr("placeholder", "Greater pls...");
        return;
    }

    if (amount > amountOwned) {
        warn("You don't have enough of that item.");

        amountInput.val("");
        amountInput.attr("placeholder", "Insufficient...");
        return;
    }

    bulkSell(itemId, amount);

    var observableId = "owned_quantity_" + itemId;
    itemSoldObserver.observe(document.getElementById(observableId), {
        childList: true
    });

    amountInput.val("");
    amountInput.attr("placeholder", "Selling...");
}

var itemSoldObserver = new MutationObserver(item_sold);
function item_sold(mutations) {

    var txt = mutations[mutations.length - 1].addedNodes[0].textContent;
    var val = parseInt(txt);

    if (amountOwned - val == amount) {
        itemSoldObserver.disconnect();
        inform("Done!");

        var amountInput = $("#sell_bulk_amount");
        amountInput.attr("placeholder", "Sold.");

    }
}

function bulkSell(id, count) {
    if (!id || !count) {
        error("Please specify both id (" + id + ") and count (" + count + ") and run again.");
        return;
    }

    for (var i = 0; i < count; i++) {
        try {
            unsafeWindow.doSell(id);
        } catch (e) {
            error("Error occured (processing " + i + ", id " + id + "): " + e);
            return;
        }
    }
}
// <-- Bulk sell

function getSwornSwords() {

    var ss = [];
    var pi = unsafeWindow.playerInventory;
    for (var i = 0; i < pi.length; i++) {
        var s = pi[i];
        if (s.slot == "Sworn Sword") {
            ss.push(s);
        }
    }

    if (ss.length > 0) {
        options.swornSwords = ss;
        options.set();
    }
}

// Do adventures anytime
$("#modal_dialogs_top").on("click", ".adventurebox .adventuremenu .adventurescroll .adventureitem.locked", lockedAdventure_onclick);
function lockedAdventure_onclick(e) {
    log("Trying to unlock adventure.");

    try {
        e.preventDefault();
        e.stopPropagation();

        var id = this.id;
        var aid = id.replace("adventure_", "");

        // console.debug(id, aid);

        unsafeWindow.chooseAdventure(aid);
    } catch (e) {
        error(e);
    }

}

function saveProductionQueue() {

    var p = unsafeWindow.productionQueue;
    if (p && p.length > 0) {
        options.productionQueue = p;
        options.set("productionQueue");
    }
}

function loadProductionQueue() {

    // console.debug("Conditions: ", !options.productionQueue, options.productionQueue.length == 0);
    if (!options.productionQueue || options.productionQueue.length == 0) {
        warn("No stored queue was found in options.");
        return;
    }

    // console.debug("Conditions: ", !unsafeWindow.productionQueue);
    if (!unsafeWindow.productionQueue) {
        warn("No queue was found on page to fill.");
        return;
    }

    if (typeof cloneInto == "function") {
        unsafeWindow.productionQueue = cloneInto(options.productionQueue, unsafeWindow);
    } else {
        unsafeWindow.productionQueue = options.productionQueue;
    }

    // Clear this from options
    options.productionQueue = null;
    options.set("productionQueue");


    // When done attempt production
    if (typeof unsafeWindow.attemptProduction == "function") {
        unsafeWindow.attemptProduction();
    }

}

$("#credits_roll").on('click', "#infoBtn", info_onclick);
function info_onclick() {
    getSwornSwords();
    $("#extenderTabContent").html(templates.ssInfo(options.swornSwords));
}

//$("#modals_container").on("click", "#hudchatbtn", warmap_onclick);
$("#modals_container").on("click", ".messagetab", warmap_onclick);
//$("#modals_container").on("click", "div.avaregions a.avaregion", warmap_onclick);

function warmap_onclick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.id !== "messagetab-wars") {
        $("#ex_search_row").remove();
        return;
    }

    setTimeout(function () {

        var row = $("#ex_search_row");
        var container = $("div#alliance_main_content");
        if (container.length > 0 && row.length == 0) {
            container.after(templates.searchAllianceBtn);
        }
    }, (options.baseDelay / 2) * 1000);
}

$("#modals_container").on("click", "#ex_alliance_search", searchAlliance_onclick);
function searchAlliance_onclick(e) {
    e.preventDefault();
    unsafeWindow.showSpinner();

    window.setTimeout(function () {

        var keys = $("#ex_alliance_search_input").val();
        if (!keys || keys.length == 0) {
            return;
        }

        var keysArray = keys.split(" ");
        var c = keysArray[0];
        for (var i = 1; i < keysArray.length; i++) {
            c += "+" +
            keysArray[i];
        }

        //console.debug("Sending data: ", c);

        GM_xmlhttpRequest({
            method: "GET",
            url: "/play/alliance_search/?tags=0&name=" + c,
            onload: function (a) {
                unsafeWindow.hideSpinner();

                if (a.error) {
                    var e = "Something went awry with your search. Please try again.";
                    "query-error" == e.error && (e = "Alliance Search by name requires more than 3 characters.");
                    unsafeWindow.doAlert("Alliance Search Error!", e);
                } else {
                    //console.debug("Raw response: ", a);
                    var response = JSON.parse(a.responseText);
                    //console.debug("Response text parsed: ", response);
                    displayResults(response.alliances);
                }
            }
        });

    }, (options.baseDelay / 2) * 1000);
}

function displayResults(a) {
    console.debug("Alliances to be displayed: ", a);

    $("#ex_alliance_search_input").val("");

    if (!(a instanceof Array) || a.length == 0) {
        $("#ex_alliance_search_input").attr("placeholder", "No alliances found");
        return;
    }

    // Clean table
    $(".avaranking:visible:first tr:not(:first)").empty();

    // Fill table
    var l = a.length > 4 ? 4 : a.length;
    for (var i = 0; i < l; i++) {
        $(".avaranking:visible:first tr:first").after(templates.allianceRow(a[i], unsafeWindow.userContext.activeRegion));
    }

}

$("#modal_dialogs_top").on('click', "#adventurebox_holder .adventuremenu .adventurescroll .adventureitem", adventureItem_onclick);
function adventureItem_onclick() {
    //log("Adventures display.");

    setTimeout(function () {

        var btn = $("#adventureSendAll");
        var container = $("div.infobar span#backbtn.btnwrap.btnsm:visible");
        if (container.length > 0 && btn.length == 0) {
            container.after(templates.sendAllBtn);
        }
    }, (options.baseDelay / 2) * 1000);
}

$("#modals_container").on('click', "[onclick*='pvpStartWithTarget']", pvpStart_onclick);
function pvpStart_onclick() {
    //log('Displaying pvp dialog with a target specified.');

    setTimeout(function () {

        var btn = $("#pvpSendAll");
        var container = $("div.infobar span#backbtn.btnwrap.btnsm:visible");
        if (container.length > 0 && btn.length == 0) {
            container.after(templates.pvpSendAllBtn);
        }
    }, (options.baseDelay / 2) * 1000);
}

$(document).on('click', "[onclick*='campChoseTarget']", avaStart_onclick);
function avaStart_onclick() {
    log('Displaying ava dialog with a target specified.');

    setTimeout(function () {

        var btn = $("#avaSendAll");
        var container = $("div.infobar span#backbtn.btnwrap.btnsm:visible");
        if (container.length > 0 && btn.length == 0) {
            container.after(templates.avaSendAllBtn);
        }
    }, (options.baseDelay / 2) * 1000);
}

function checkSource() {
    console.log("-------------------------------------\\");
    console.log("Script scheduled for update check.");
    console.log("-------------------------------------/");

    var lastUpdateCheck = GM_SuperValue.get("lastUpdateCheck", "never");
    console.log("Function definitions updated: " + lastUpdateCheck);
    console.log("Source control check for integrity initiated...");
    var updateRequired = false;

    eval(GM_getResourceText("original"));
    if (typeof original == "undefined") {
        error("Cannot find original function data.");
        return;
    }

    try {

        for (var fn in original) {
            console.log("Current function: " + fn);

            if (!original.hasOwnProperty(fn)) {
                console.error("Function does not have a stored value!");
                continue;
            }

            console.log("Retrieving page function...");

            if (!unsafeWindow[fn]) {
                console.error("No such function on page!");
                continue;
            }

            var pageFn = unsafeWindow[fn].toString();
            console.log("Function retrieved. Comparing...");

            if (pageFn !== original[fn]) {
                console.warn("Changes detected! Please revise: " + fn);

                updateRequired = true;
                continue;
            }

            console.log("No changes were detected. Continuing...");
        }
    } catch (e) {
        alert("Source control encountered an error: " + e);
        return;
    }

    console.log("-------------------------------------|");
    console.log("-------------------------------------| > End of script update check");

    if (!updateRequired) {
        GM_SuperValue.set("lastUpdateCheck", new Date());
    }

    alert("Source control resolved that " +
    (updateRequired ? "an update is required." : "no changes are necessary.") +
    "\nSee the console log for details.\nPress OK to reload again.");
}

// jQuery ajax
function ajax(params) {
    if (typeof params != "object") {
        error("The request requires parameters.");
        return;
    }

    // Required
    if (!params.url) {
        error("Request url was not passed.");
        return;
    }

    if (!params.onload && !params.success) {
        error("Callback handler missing. Cannot execute.");
        return;
    }

    if (!params.type) {
        params.type = "GET";
    }

    if (!params.timeout) {
        params.timeout = 3E4;
    }

    if (!params.onerror) {
        params.onerror = function (gme) {
            error("Error occurred while running the request. Details:");
            console.debug("Original ajax request parameters: ", params);
            console.debug("Grease monkey error response: ", gme);
        }
    }

    if (!params.onload) {
        params.onload = function (gmr) {

            if (!gmr.response) {
                params.error ? params.error(gmr) : params.onerror(gmr);
            } else {
                //var headerString = gmr.responseHeaders;
                //var headers = headerString.split('\n');

                //console.debug("Debugging response headers: ", headers);
                if (gmr.responseHeaders.indexOf("Content-Type: application/json;") > -1) {
                    var response = JSON.parse(gmr.responseText);
                    params.success(response);
                } else {
                    params.success(gmr.responseText);
                }
            }

            if (params.complete)
                params.complete(gmr);
        };
    }

    if (!params.ontimeout) {
        params.ontimeout = function (gmt) {
            warn("The request timed out. Details:");
            console.debug("Original ajax request parameters: ", params);
            console.debug("Grease monkey error response: ", gmt);
        };
    }

    window.setTimeout(function () {
        GM_xmlhttpRequest({
            //binary: false,
            //context: {},
            //data: "",
            //headers: {},
            method: params.type,
            //onabort: params.onabort,
            onerror: params.onerror,
            onload: params.onload,
            //onprogress: params.onprogress,
            //onreadystatechange: params.onreadystatechange,
            ontimeout: params.ontimeout,
            //overrideMimeType: "",
            //password: "",
            //synchronous: false,
            timeout: params.timeout,
            //upload: {},
            url: params.url
            //user: ""
        });
    }, 1E3);
}