doLog = function() {
};
log("Logging killed.", "initialize");

animatedCoins.init = function(b, a, e, g) {
    if (isWeb()) {
        var c,
            d,
            f,
            h,
            k = { images: ["/images/animations/coin_flip.png"], animations: { all: [0, 32] }, frames: { regX: 0, height: 60, count: 33, regY: 0, width: 61 } },
            m = {
                images: ["/images/animations/coin_sparkle.png"],
                animations: { all: { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } },
                frames: [
                    [0, 0, 128, 128, 0, 0, 0], [128, 0, 128, 128, 0, 0, 0], [256, 0, 128, 128, 0, 0, 0], [384, 0, 128, 128, 0, 0, 0], [512, 0, 128, 128, 0, 0, 0], [640, 0, 128, 128, 0, 0, 0], [768, 0, 128, 128, 0, 0, 0], [896, 0, 128, 128, 0, 0, 0], [0, 128, 128, 128, 0, 0, 0],
                    [128, 128, 128, 128, 0, 0, 0], [256, 128, 128, 128, 0, 0, 0], [384, 128, 128, 128, 0, 0, 0], [512, 128, 128, 128, 0, 0, 0], [640, 128, 128, 128, 0, 0, 0], [768, 128, 128, 128, 0, 0, 0]
                ]
            },
            l,
            n,
            p = false;

        //EXTENDER :: Modification, seriously?
        // bugfix: b.offset is undefined (offset from button to silver visually)
        if (null === b || void 0 === b || b.length == 0) {
            return;
        } else if (null === a || void 0 === a) {
            return;
        } else {
            if (null === e || void 0 === e)
                e = [
                    0,
                    0
                ];
            if (null === g || void 0 === g) g = [0, 0];
            d = $("<canvas>").attr({ id: "animatedCoins", "class": "coinCanvasAnimation", width: "130", height: "120" }).prependTo($("body"));
            c = d[0];
            h = $("<canvas>").attr({ id: "animatedCoinsSparkle", "class": "coinCanvasAnimation", width: "130", height: "120" }).prependTo($("body"));
            f = h[0];
            c = new createjs.Stage(c);
            f = new createjs.Stage(f);
            null === b.offset() ? (h.remove(), d.remove(), console.warn("animatedCoins: startingElement.offset() is null. Exiting script.")) : null === a.offset() ? (h.remove(), d.remove(),
                console.warn("animatedCoins: endingElement.offset() is null. Exiting script.")) : (d.offset({ left: b.offset().left + e[0], top: b.offset().top + e[1] }), h.offset({ left: b.offset().left + e[0], top: b.offset().top + e[1] }), e = new createjs.SpriteSheet(k), m = new createjs.SpriteSheet(m), l = new createjs.Sprite(e), l.x = 30, l.y = 25, n = new createjs.Sprite(m), l.on("animationend", function(c, f) {
                c.visible = false;
                doLog("animation end");
                null === b.offset() ? (h.remove(), d.remove(), console.error("animatedCoins: startingElement.offset() is null")) :
                    null === a.offset() ? (h.remove(), d.remove(), console.error("animatedCoins: endingElement.offset() is null")) : (h.offset({ left: a.offset().left + g[0], top: a.offset().top + g[1] }), n.visible = true, n.gotoAndPlay("all"), l.stop(), p = true);
            }), n.on("animationend", function(a, b) {
                n.visible = false;
                p && (n.stop(), d.fadeOut(500, function(a) { d.remove(); }), h.remove());
            }), l.gotoAndPlay("all"), n.gotoAndPlay("all"), f.addChild(n), c.addChild(l), createjs.Ticker.setFPS(30), createjs.Ticker.addEventListener("tick", c), createjs.Ticker.addEventListener("tick",
                f), $(d).animate({ left: a.offset().left + g[0], top: a.offset().top + g[1] }, 1E3));
        }
    }
};
log("Animated coins fixed.", "initialize");

doInstantSpeedUp = function doInstantSpeedUp(c, a, callback) {
    var b = buildingById(c),
        d = getCurrentSpeedUpType(b.producing_archetype_id, b.recipe_symbol);

    // EXTENDER :: Modification
    if (instantSpeedCost(b.build_remaining, d) > 0) {
        console.log('EXTENDER :: The instant speed up costs money. Exiting...');
        return false;
    }

    if (false == hasGold(instantSpeedCost(b.build_remaining, d), function() {
        doInstantSpeedUp(c, true, callback);
    }, a) && true != a) return false;
    playSound("coins");
    return speedBuild(-1, c, callback);
};
log("Instant speed up returns if gold is required.", "initialize");

doFinishProduction = function doFinishProduction(c, callback) {
    var a = buildingByItemId(c), b = itemFromId(a.producing_archetype_id);
    userContext.lastFinish = a.symbol;
    doLog("doFinishProduction: building_id=" + c + " symbol=" + a.symbol + " producing=" + b.symbol);
    "Upgrade" !== b.slot && (analytics.track("Production Finish", { building_symbol: a.symbol, item_symbol: b.symbol, item_category: b.slot }), analytics.wizardtrack("Production Finish", { building_symbol: a.symbol, item_symbol: b.symbol, item_category: b.slot }));
    var d = "finish-" + c;
    userLock(d) && (playSound("build"),
        isWeb() && $("#collect_" + a.symbol).html(""), $.ajax({
            url: "/play/finish_production/" + c,
            dataType: "JSON",
            success: function(a) {
                //console.debug("Logging server response for doFinishProduction: ", a);

                doLog("doFinishProduction: succeess ");
                freeLock(d);
                var b = buildingByItemId(c, a.building);
                userContext.playerData.character = a.character;
                userContext.playerData.user.money = a.user.money;
                userContext.playerData.stat.onboarding = a.stat.onboarding;
                userContext.playerData.stat.num_items_produced = a.stat.num_items_produced;
                userContext.playerData.stat.produced_stone = a.stat.produced_stone;
                userContext.playerData.stat.building_upgrades_finished =
                    a.stat.building_upgrades_finished;
                b.producing_archetype_id = null;
                b.modifier = null;
                b.recipe_symbol = null;
                var f = extractItemBySymbol(playerInventory, b.symbol);
                f.effective_upgrade_level = a.building.effective_upgrade_level;
                f.producing_archetype_id = null;
                f.modifier = null;
                f.recipe_symbol = null;

                // EXTENDER :: Modification, execute current code ONLY if there's a produced item returned!
                if (a.produced_item) {
                    if (userContext.intCurrentRecipeIndex = null,
                        doLog("doFinishProduction: data.produced_item.id=" + a.produced_item.id + " quantity=" + a.produced_item.quantity),
                        insertInventoryFromItem(playerInventory, a.produced_item),
                        theNewItem = extractItemById(playerInventory, a.produced_item.id), 1 == a.is_loot) {
                        0 < a.enhanced_loot_roll
                            ? dialogAlert({
                                style: "alert",
                                text: "The result of your production (enhanced) is: " + a.produced_full_name,
                                items: [theNewItem],
                                heading: "You have produced...",
                                button1: "Okay"
                            }) : dialogAlert({
                                style: "alert",
                                text: "The result of your production is: " + a.produced_full_name,
                                items: [theNewItem],
                                heading: "You have produced...",
                                button1: "Okay"
                            });
                    } else if (0 < a.affix_chance) {
                        var m;
                        m = "" + ("You have a " + a.affix_chance_from_stats +
                            "% chance to produce a superior-quality item from your talents, equipment and buildings.");
                        a.bonus_item_name && (m += " Your " + a.bonus_item_name + " adds another +" + a.affix_chance_from_bonus + "% chance to produce a superior-quality item from your talents, equipment and buildings.");
                        m = a.affix_roll1 <= a.affix_chance && a.affix_roll2 <= a.affix_chance ? m + "<p/>Critical Success! You obtained a superb result!" : a.affix_roll1 > a.affix_chance && a.affix_roll2 > a.affix_chance ? m + "<p/>You obtained a normal result." : m + "<p/>Success! You obtained a good result.";
                        dialogAlert({ style: "alert", text: m, items: [theNewItem], heading: a.produced_full_name, button1: "Okay" });
                    }

                    userContext.newBldgOrUpgrade = true;
                    var q;

                    "Upgrade" != theNewItem.slot ?
                        (userContext.newProducedItem = theNewItem, isWeb()
                                && $("#collect_" + f.symbol).html(renderUpgradeCollect(f)),
                            isWeb() && $("#build_panel_action_" + f.id).html(renderBuildPanelAction(f)),
                            isWeb() && $("#speed_button_" + f.id).hide())
                        : q = theNewItem.symbol;

                    isWeb() ? (renderBuildingInventory(userContext.playerData),
                            renderBuildingsOnScreen(userContext.playerData))
                        : (f = null, f = null == q
                                ? { symbol: b.symbol, status: "idle" }
                                : { symbol: b.symbol, status: "idle", upgrade: q },
                            iosSignal("finish_production", "update", f),
                            isAndroid()
                                && mobileCooldownDataSignal([{ mode: "building", symbol: b.symbol }]),
                            refreshActiveBuildingPanel(),
                            $("#building_tab_prod, .buildingupgradetree").fadeTo("slow", "1"));

                    uiEvent("do_finish_production");
                    uiEvent("building_panel_" + userContext.activeBuildingPanel);
                    a.produced_item && "stacks_of_coins" == a.produced_item.symbol && retrievePlayerData(true, function(a) {
                        userContext.playerData.quests =
                            a.quests;
                        reRenderQuestActionItems();
                    });

                    "Upgrade" == theNewItem.slot && buildingUpgradePanel(b.symbol);
                    updatePlayerInfo(userContext.playerData);
                    updateAllStatus();
                }

                // EXTENDER :: Modification
                if (typeof callback == "function") {
                    callback();
                }
            }
        }));
};
log("Finish production and call callback if any. Fix bug.", "initialize");

doProduction = function(c, a, b, d, g, callback) {
    userContext.lastFinish = null;
    null == b && (b = 1);
    doLog("doProduction: symbol=" + c + " producer=" + a + " quantity=" + b);
    var p = null, f = "", m = null, q = "", k = null, D = null;
    uiEvent("start_production");
    null == userContext.playerData.stat.num_shop_items_started && (userContext.playerData.stat.num_shop_items_started = 0);
    userContext.playerData.stat.num_shop_items_started += 1;
    for (var u = 0; u < userContext.recipeData.length; u++)
        if (console.log("DEBUG: n=" + userContext.recipeData[u].category + ", symbol: " +
            userContext.recipeData[u].output), g == userContext.recipeData[u].symbol || null == g && (userContext.recipeData[u].output == c || userContext.recipeData[u].output_loot == c) && userContext.recipeData[u].category == a) {
            p = userContext.recipeData[u];
            p.output == c ? (k = itemFromSymbol(c), q = k.full_name) : (p.output_loot == c && (m = c), q = p.name);
            D = u;
            components = userContext.recipeData[u].input.split(",");
            quantity_components = userContext.recipeData[u].input_quantity.split(",");
            var s = itemFromSymbol(userContext.recipeData[u].category);
            if (true ==
                userContext.recipeData[u].unlocked) {
                if (1 < userContext.recipeData[u].input.length)
                    for (s = 0; s < components.length; s++) {
                        var y = itemFromSymbol(components[s]), w = false;
                        0 == s && true == userContext.recipeData[u].evolution && (w = true);
                        w = sumInventoryQuantity(y.symbol, w);
                        if (parseInt(quantity_components[s]) * b > w) {
                            "" == f && (f = "You need more of the following:<p/>");
                            f += "<div>";
                            if (4 <= userContext.playerData.character.level)
                                switch (components[s]) {
                                case "stone":
                                case "iron":
                                case "fur":
                                case "ore":
                                case "horse":
                                case "riverways_fish_consumable":
                                case "smallfolk":
                                case "wood":
                                case "cloth":
                                case "grains":
                                    w =
                                        parseInt(quantity_components[s]) * b - w;
                                    if (cost_item = itemFromSymbol("pennyroyal")) var z = cost_item.price_perk_points * w;
                                    f += '<div id="basic_resource_' + components[s] + '">';
                                    f += itemMiniView(y, { extra_styles: "left:-70px", quantity_override: w });
                                    f += '<span style="position: relative; left: 250px; top: -88px" class="btnwrap btnmed btnprice" onclick="getBasicResource(\'' + components[s] + "'," + w + ',true);"><span class="btnedge"><a class="btngold">Get Now</a><em>for</em><strong>' + z + "</strong></span></span>";
                                    f += "</div>";
                                    break;
                                default:
                                    f += itemMiniView(y);
                                }
                            f += "</div>";
                            f += "<p>" + y.howto + "</p>";
                        }
                    }
            } else f = "You need <em>" + s.full_name + "</em> to produce that.";
            break;
        }
    if ("" != f) doAlert("Requirements: " + q, f), analytics.track("Production Blocked-Resources", { item_symbol: c }), analytics.wizardtrack("Production Blocked-Resources", { item_symbol: c });
    else if (p && hasMoney(p.craft_cost * b, function() { doProduction(c, a, b, d, g); })) {
        f = JSON.parse(JSON.stringify(userContext.playerData.inventory));
        u = [];
        p.output == c ? (k = itemFromSymbol(c), q = k.full_name) : (p.output_loot ==
            c && (m = c), q = p.name);
        components = p.input.split(",");
        quantity_components = p.input_quantity.split(",");
        s = itemFromSymbol(p.category);
        if (true == p.unlocked && (userContext.intCurrentRecipeIndex = D, 1 < p.input.length)) for (s = 0; s < components.length; s++) y = itemFromSymbol(components[s]), w = false, 0 == s && true == p.evolution && (w = true), depleteItems(y.symbol, parseInt(quantity_components[s]) * b, null, u, w);
        q = "";
        D = null;
        for (s = 0; s < u.length; s++)
            if (y = itemFromSymbol(u[s].symbol), u[s].full_name != y.full_name)
                D = JSON.parse(JSON.stringify(u[s])),
                    q += "[" + u[s].full_name + "]";
            else if (itemHasSeals(u[s]) && (!u[s].preserve_attributes || false == u[s].preserve_attributes)) D = JSON.parse(JSON.stringify(u[s])), y = generateSealNameList(u[s]), q += "[" + u[s].full_name + " : " + y + "]";

        // EXTENDER :: Modification
        if (true != d && null != D && !extender_confirmSuperiorMaterials) {
            return playerInventory = JSON.parse(JSON.stringify(f)), userContext.playerData.inventory = playerInventory, dialogAlert({
                style: "confirm",
                margin_top: 100,
                items: [D],
                button2: "Not Now",
                button2_action: function() { closeAlert(); },
                button1: "Confirm",
                button1_action: function() {
                    closeAlert();
                    return doProduction(c, a, b, true, g);
                },
                heading: "Confirm Superior Materials",
                text: "Producing this item now will consume superior versions of your materials: " + q + "<p/>Are you sure you want to contribute superior versions of materials to produce this item?"
            }), false;
        }

        var I = buildingBySymbol(userContext.activeBuildingPanel);
        I.build_remaining = p.craft_duration * b;
        I.original_build_seconds = p.craft_duration * b;
        I.build_progress = 0;
        "" != p.output && (I.producing_archetype_id = itemFromSymbol(p.output).id);
        I.recipe_symbol = p.symbol;
        I.action_sub_id = b;
        f = renderBuildingConstruction(I);
        isWeb() && $("#bc_" + I.id).html(f);
        displayBuildingCooldown(I);
        "Upgrade" == itemFromId(I.producing_archetype_id).slot ? buildingUpgradePanel(userContext.activeBuildingPanel, true, false) : (buildingUpgradePanel(userContext.activeBuildingPanel, true, false, true), buildingTabProd(), isWeb() && $("#collect_" + I.symbol).html(renderUpgradeCollect(I)));
        p = "/play/set_production";
        p = (m ? p + ("?loot_symbol=" + m + "&producer_symbol=" + a) : k ? p + ("/" + c + "?producer_symbol=" + a) : p + ("?producer_symbol=" + a)) + ("&quantity=" + b);
        g && (p += "&recipe_symbol=" + g);
        //console.debug("Tampering with the url: ", p);

        $.ajax({
            url: p,
            dataType: "JSON",
            success: function(a) {
                // EXTENDER :: Modification
                if (!a.num_shop_items_started && a.status) {
                    //console.debug("Server responded with: ", a);
                    return;
                }

                userContext.prodProgressShow = null;
                userContext.playerData.stat.num_shop_items_started = a.num_shop_items_started;
                updateAllStatus();
                uiEvent("do_production");
                isWeb() || iosSignal("building", "cooldown", mobileCooldownData({ mode: "building", symbol: I.symbol, flag: "production_started" }));

                // EXTENDER :: Modification
                if (typeof callback == "function") {
                    callback();
                }
            }
        });
    }
};
log("Do production and call callback if any. Inject superior materials condition.", "initialize");

buildTimerUpdate = function(c, a, b) {
    $("#timer-" + c).html(renderBuildTime(a));
    $("#timer-panel-" + c).html(renderBuildTime(a));

    percent = 100 - 100 * (a / b);
    $("#progress-" + c).html('<span style="width:' + percent + '%;"></span>');

    var d = buildingById(c);
    d.build_remaining = a;
    markup = renderBuildPanelAction(d);

    $("#speed_button_" + c).show();
    $("#build_panel_action_" + c).html(markup);
    $("#production_timer_" + c).html(renderBuildTime(d.build_remaining, true));
    $("#production_timer_upper_" +
        c).html(renderBuildTime(d.build_remaining));
    $("#production_progress_" + c).css({ width: percent + "%" });
    $("#duration_long_" + c).html(durationLong(buildTimerDescription(d), a, b));
    a--;
    userContext.doBuildId == c && (300 >= a ?
        ($("#speed_up_skip_block").hide(),
            $("#speed_up_skip_use").show()) :
        ($("#speed_up_skip_use").hide(),
            $("#speed_up_skip_block").show()),
        $(".speed_building_" + c).html() != renderSpeedUpButton(c) && $(".speed_building_" + c).html(renderSpeedUpButton(c)));

    d.cooldown = a;
    d.original_cooldown_seconds = b;
    displayBuildingCooldown(d);
    0 < a || (closeSpeedUp(), finalizeBuildingConstruction(d), clearBuildingTimer(d.symbol));

    // EXTENDER :: Modification REVISE
    if (a == 300 - 1) {
        doInstantSpeedUp(c, false, function() {
            setTimeout(function() {
                doFinishProduction(d.item_id);
            }, (extender_queueDelay / 2) * 1000);

            setTimeout(function() {
                var el = getElement(d.symbol);
                if (el) {
                    executeElement(el);
                }
            }, extender_queueDelay * 1000);
        });
    } else if (a < 300 - 10) {
        doInstantSpeedUp(c, false, function() {
            doFinishProduction(d.item_id);
        });
    }
};
log("Build custom timer update. Speed up and finish automatically, grab production item if any and execute.", "initialize");

doCollect = function(c) {
    lock_name = "collect-" + c;
    if (userLock(lock_name)) {
        var a = buildingByItemId(c);
        0 < predictCollect(a) && (playSound("coins"), isWeb() && animatedCoins.init($("#collectbtn"), $("#silver"), [-10, -40], [-72, -44]));
        uiEvent("collect_" + buildingSymbolFromItemId(c), userContext.PlayerData);
        the_url = "/play/collect_building/" + c + "?client_seqnum=" + userContext.player_data_seqnum;

        isWeb() || showSpinner();
        $.ajax({
            url: the_url,
            dataType: "JSON",
            success: function(b) {
                freeLock(lock_name);
                doLog("doCollect: building_id=" +
                    c + " data.money=" + b.money);
                updateSilver(b.money);
                updateBaseTime(b.base_time);
                a.last_collected_at = b.last_collected_at;
                userContext.playerData.stat.buildings_collected = b.buildings_collected;
                userContext.playerData.stat.onboarding = b.onboarding;
                isWeb() || (iosSignal("building_collected"), hideSpinner());
                isWeb() && $("#collect_" + a.symbol).html(renderUpgradeCollect(a));
                buildingUpgradePanel(a.symbol);
                b = renderBuildingOwned(a);
                isWeb() && $("#bc_" + a.id).html(b);
                updateAllStatus();
                questListings();

                // EXTENDER :: Modification
                closeModalLarge('modal_dialogs_top');
            }
        });
    }
};
log("Close dialog when silver is collected.", "initialize");

claimDaily = function() {
    showSpinner();
    $.ajax({
        url: "/play/advice_claim_daily",
        dataType: "JSON",
        success: function(c) {
            console.debug("Logging response from the server: ", c);
            hideSpinner();

            // EXTENDER :: Modification
            // bugfix: undefined silver and gold
            if (c.status && c.status == "OK") {
                return;
            }

            $("#claimed_holder").html("<h5>Claimed</h5>");
            updateSilver(c.total_silver);
            updateGold(c.total_gold);
            $(".claimrewardchest").hide();
            $("#daily_reward_statview").html(itemStatViewFromSymbol(c.item, { produce: "Continue", produce_callback: "welcomeClaimed" }));
            $("#dailynewsbtn").removeClass("btnglow");

            var a = buildingBySymbol("keep");
            userContext.playerData.stat.daily_streak_claimed = userContext.playerData.stat.daily_streak;
            a && $("#bc_" + a.id).html(renderBuildingOwned(a));
            isWeb() || iosSignal("daily_reward_claimed", null, c.item);

            // EXTENDER :: Modification
            $(".welcomemodal").hide();
        }
    });

    return false;
};
log("Claim daily updates money only if claimed. Close when ready.", "initialize");

finishAll = function() {
    log("Checking buildings...");

    var btn = $("#extender_finishBtn a");
    if (btn && btn.length > 0) btn.text("Finishing...");

    for (var i = 0; i < userContext.buildingsData.length; i++) {
        var b = userContext.buildingsData[i];
        if(b.symbol === "counting_house"){
            continue;
        }

        if (buildingFinished(b)) {
            log("Attempt to finish production on " + b.symbol);
            doFinishProduction(b.item_id, finishAll);
            return;
        }
    }

    if (btn && btn.length > 0) btn.text("Finished");
    log("All buildings are now finished.");
    inform('Done');
};
log("Finish all buildings whole different way, make use of doFinish callback.", "initialize");

applySelectedUpgrade = function(c, a, callback) {
    lock_name = "upgrade-" + c.id;
    userContext.lastFinish = null;

    var b;

    if (0 < c.gold && null == a)
        doGoldUnlock(c.id, function() {
            applySelectedUpgrade(c, true, callback);
        });
    else if (hasMoney(c.silver, function() {
        applySelectedUpgrade(c, a, c.silver);
    }) && userLock(lock_name)) {
        var d = buildingUpgradeResourceCheck(c.building_id, c.id);
        if (isWeb()) {
            if (null != d.markup && "" != d.markup) {
                doAlert("Resources Required", "You need additional resources to construct that upgrade:<p/>" + d.markup);
                return false;
            }
        } else if (null !=
            d.strMissingComponentText) {
            if (isAndroid()) {
                iosSignal("building", "upgrade_fail", d);
                return false;
            }
            return d;
        }
        b = d.item;
        playSound("build");
        var g = buildingById(c.building_id);
        itemFromSymbol(g.symbol);
        d = extractItemBySymbol(userContext.playerData.inventory, g.symbol).upgrade_level - 1;
        0 > d && (d = 0);
        userContext.buildIndex++;
        g.build_progress = 0;
        g.producing_archetype_id = b.id;
        $.ajax({
            url: "/play/apply_upgrade/" + c.id,
            dataType: "JSON",
            success: function(result) {
                freeLock(lock_name);
                if (result.resource_list)
                    for (var i = 0; i < result.resource_list.length; i++) {
                        var m =
                            extractItemBySymbol(playerInventory, result.resource_list[i]);
                        m && (m.quantity -= parseInt(result.resource_quantities[i]));
                    }
                updateSilver(result.money);
                updateBaseTime(result.base_time);
                userContext.playerData.stat.onboarding = result.onboarding;
                userContext.playerData.stat.building_upgrades_added = result.building_upgrades_added;
                g.build_remaining = result.build_remaining;
                g.original_build_seconds = result.original_build_seconds;
                displayBuildingCooldown(g);
                isWeb() && buildingUpgradePanel(g.symbol);
                result = renderBuildingConstruction(g);
                $("#bc_" + g.id).html(result);
                uiEvent("add_" +
                    userContext.activeBuildingPanel, userContext.PlayerData);
                selectedUpgrade = extractItemBySymbol(playerInventory, b.symbol);
                q_upgrade = 1;
                selectedUpgrade && (q_upgrade = selectedUpgrade.quantity + 1);
                $("#addbtn_container").html(addButtonUpgrade(b, false, q_upgrade));
                isWeb() ? selectUpgrade(userContext.activeUpgrade) : iosSignal("building", "cooldown", mobileCooldownData({ mode: "building", symbol: g.symbol, flag: "production_started" }));
                questListings();
                analytics.track("Building Apply-Upgrade", {
                    building: userContext.activeBuildingPanel,
                    upgrade: itemData[itemById[c.id]].symbol,
                    cost: itemData[itemById[c.id]].cost
                });
                analytics.wizardtrack("Building Apply-Upgrade", { building: userContext.activeBuildingPanel, upgrade: itemData[itemById[c.id]].symbol, cost: itemData[itemById[c.id]].cost }); // EXTENDER :: Modification

                // EXTENDER :: Modification
                if (typeof callback == "function") {
                    callback();
                }
            }
        });
    }

    return false;
};
log("Do upgrade and call callback function.", "initialize");

speedBuild = function speedBuild(c, a, callback) {
    $("#modal_dialogs_top2").hide();
    doLog("speedBuild: speed_item=" + c + " item_id=" + a);
    $.ajax({
        url: "/play/build_now/" + a + "?complete=" + c,
        dataType: "JSON",
        success: function(b) {
            //console.debug("Logging server response for speedBuild: ", b);

            userContext.playerData.user.money = b.user.money;
            userContext.playerData.stat.onboarding = b.stat.onboarding;
            userContext.playerData.chapter = b.chapter;
            var d = buildingById(a, b.building);
            doLog("speedBuild: speed_item:");
            doLog(b.speed_item);
            b.speed_item && insertInventoryFromItem(userContext.playerData.inventory,
                b.speed_item);
            insertInventoryFromItem(userContext.playerData.inventory, b.produced_item);
            logLastItem("speedBuild:A");
            userContext.buildingsData && (userContext.playerData.buildings = userContext.buildingsData);
            playerInventory && (userContext.playerData.inventory = playerInventory);
            userContext.chapterData = b.chapter;
            d && (analytics.track("SpeedUp-Building", { building: d.symbol, speed_item: c }), analytics.wizardtrack("SpeedUp-Building", { building: d.symbol, speed_item: c }));
            userContext.buildIndex++;
            logLastItem("speedBuild:B");
            finalizeBuildingConstruction(d);
            isItemBuildingUpgrade(d) || null == d.producing_archetype_id && null == d.recipe_symbol ? (renderBuildingInventory(userContext.playerData, buildingUpgradePanel, userContext.activeBuildingPanel, true), isWeb() || iosSignal("building", "cooldown", mobileCooldownData({ mode: "building", symbol: d.symbol, flag: "speed_up" }))) : (userContext.craftingItemFinished = true, renderBuildingInventory(userContext.playerData, buildingUpgradePanelProd, userContext.activeBuildingPanel, true), $("#collect_" + d.symbol).html(renderUpgradeCollect(d)),
                $("#build_panel_action_" + d.id).html(renderBuildPanelAction(d)), $("#speed_button_" + d.id).hide());
            renderBuildingsOnScreen(userContext.playerData);
            d && uiEvent("building_panel_" + d.symbol);

            // EXTENDER :: Modification
            if (typeof (callback) == "function") {
                callback();
            }
        }
    });
};
log("Speed build is what actually calls the callback (not doInstantSpeedUp).", "initialize");

uiEvent = function uiEvent(c, a, b) {
    if (isWeb()) {
        log("uiEvent: event_name=[" + c + "]", "DEBUG");
        a = userContext.playerData;
        if (void 0 == a) return doLogEvent("uiEvent: playerData null"), !1;
        var d = "", g = !1, p = void 0, f = void 0, m = void 0, q = void 0, k = void 0, D = f = "", m = "Okay", u = void 0, s = void 0, y = 0, w = 0, z = 240, I = 0, M = 0, N = 0, W = "", h = "", C = void 0, B = 0, A = 0, G = void 0, O = void 0, H = void 0, Q = !1, P = void 0, R = void 0, V = void 0, X = void 0, T = void 0, U = void 0, ba = !1, S = void 0, ca = !0, Y = !1, Z = void 0, aa = !1, ea;
        "confirm_override" == c && (ba = g = !0, Q = !1);
        h = "test_event";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_test_event"), g = !0, d = "ui_test_event", !0 == g && (u = subGotStrings("Text to display <strong>next</strong> to something."), y = void 0 != b && void 0 != b.y ? b.y : 20, w = void 0 != b && void 0 != b.x ? b.x : 50, C = "top_left", s = ".alignmenttabs"), doLogEvent("after checks=" + g);
        h = "test_alert";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_test_alert"), g = !0, d = "ui_test_alert", !0 == g && (p = 'You will spend Silver<img src="/images/icon-silver-sm.png" class="tutorial_coin"></img> to grow your holdings', D = "test_alert_testhttps://intranet.disruptorbeam.com:8443/browse/GOT-9993"), doLogEvent("after checks=" + g);
        h = "test_arrow";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_test_arrows"),
                g = !0, d = "ui_test_arrows", !0 == g && (C = "top_right", s = ".bonus", h = "0", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "0", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "test_clear";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_test_clear"), g = !0, d = "ui_test_clear", !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 20, w = void 0 != b && void 0 != b.x ? b.x : 50, s = ".actionheader"), doLogEvent("after checks=" +
                g);
        h = "ui_test";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_test_alert_chain"), g = !0, d = "ui_test_alert_chain", !0 == g && (p = "This is a test message.", D = "test_alert"), doLogEvent("after checks=" + g);
        h = "alert_test_alert_button1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_test_alert_chain2"),
                g = !0, d = "ui_test_alert_chain2", doLogEvent("uiEvent: exclude_flag=test_flag"), the_val = 0, void 0 != userContext.flags.test_flag && (the_val = userContext.flags.test_flag), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("This appears if test_flag is not set (which it should now be)"), s = ".actionheader", G = "test_flag"), doLogEvent("after checks=" + g);
        h = "alert_test_alert_button1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_test_alert_chain3"),
                g = !0, d = "ui_test_alert_chain3", doLogEvent("uiEvent: require_flag = test_flag"), 1 != userContext.flags.test_flag && (g = !1), !0 == g && (u = subGotStrings("test_flag was previously set"), s = ".actionheader"), doLogEvent("after checks=" + g);
        h = "test_device";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_device_web_event"), g = !0, d = "ui_device_web_event", !0 != isDevice("web") && (g = !1), !0 == g && (p = "This is a Web device.",
                D = "test_alert"), doLogEvent("after checks=" + g);
        h = "test_device";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_device_ipad_event"), g = !0, d = "ui_device_ipad_event", !0 != isDevice("ipad") && (g = !1), !0 == g && (p = "This is an iPad!", D = "test_alert"), doLogEvent("after checks=" + g);
        h = "test_ios_signal";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c,
            h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_device_test_ios_signal"), g = !0, d = "ui_device_test_ios_signal", !0 == g && (q = "test", k = "additional:test_parameters"), doLogEvent("after checks=" + g);
        h = "test_native_device";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_native_device_test"), g = !0, d = "ui_native_device_test", !0 == g && (u = subGotStrings("This is a tooltip for native device code"),
                y = void 0 != b && void 0 != b.y ? b.y : 300, w = void 0 != b && void 0 != b.x ? b.x : 200, z = 200), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) {
            doLogEvent("ui triggered: ui_onboarding_begin");
            var g = !0, d = "ui_onboarding_begin", h = "pro_q1_take_the_slavers_keep", K = h.replace("[", "").replace("]", "");
            doLogEvent("quest_active: " + h);
            if (-1 != h.indexOf(",")) {
                var E = /\[.*\]/.test(h), L = !E;
                $.each(K.split(","),
                    function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; });
                L || (g = !1);
            } else !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1);
            !0 == g && (u = subGotStrings("Start your first <strong>Quest</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 171, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h);
            doLogEvent("after checks=" + g);
        }
        h =
            "quest_3option_pro_q1_take_the_slavers_keep";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_jons_command"), g = !0, d = "ui_jons_command", !0 == g && (u = subGotStrings("Read this speech from <strong>Lord Jon Arryn</strong>."), M = 5E3, W = "fade_ui_jon_command", y = void 0 != b && void 0 != b.y ? b.y : 300, w = void 0 != b && void 0 != b.x ? b.x : 400, z = 185, I = 58, C = "top_left", s = ".questiconcircle", h = "233", A = -1 != h.indexOf(",") ?
                h.split(",") : h, h = "370", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "fade_ui_jon_command";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_jon_command2"), g = !0, d = "ui_jon_command2", !0 == g && (u = subGotStrings("Answer him by clicking on the <strong>Decision</strong> button below."), y = void 0 != b && void 0 != b.y ? b.y : 315, w = void 0 != b && void 0 != b.x ? b.x : 285, z = 225, I = 64, C = "bottom_left",
                s = ".questiconcircle", h = "358", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "246", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_results_pro_q1_take_the_slavers_keep";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_results_pro_q1_take_the_slavers_keep"), g = !0, d = "ui_quest_results_pro_q1_take_the_slavers_keep", !0 == g && (u = subGotStrings("<strong>Rewards</strong> display at the end of a Quest."),
                M = 1E5, W = "fade_ui_quest_results_pro_q1_take_the_slavers_keep", y = void 0 != b && void 0 != b.y ? b.y : 18, w = void 0 != b && void 0 != b.x ? b.x : 350, z = 165, C = "left", s = ".rewardwrapper", h = "14", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "276", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "fade_ui_quest_results_pro_q1_take_the_slavers_keep";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_fade_ui_quest_results_pro_q1_take_the_slavers_keep"),
                g = !0, d = "ui_fade_ui_quest_results_pro_q1_take_the_slavers_keep", !0 == g && (s = ".rewardwrapper", h = "96", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-275", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_close_pro_q1_take_the_slavers_keep";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_close_pro_q1_take_the_slavers_keep"), g = !0, d = "ui_quest_close_pro_q1_take_the_slavers_keep",
                doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pro_pro_q2_a_widowers_oath"), g = !0, d = "ui_pro_pro_q2_a_widowers_oath", h = "pro_q2_a_widowers_oath", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) {
                if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " +
                    c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1;
            }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("<strong>New</strong> Quests appear here. Click here to start this Quest."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 185, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_post_pro_q2_a_widowers_oath_action_choice_1, quest_post_pro_q2_a_widowers_oath_initial_choice_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_post_pro_choose_pro_q2_a_widowers_oath"), g = !0, d = "ui_quest_post_pro_choose_pro_q2_a_widowers_oath", !0 == g && (u = subGotStrings("You now have a <strong>Sworn Sword</strong>."), y = void 0 != b && void 0 != b.y ? b.y : -86, w = void 0 != b && void 0 != b.x ? b.x : 399, z = 158, C = "bottom_left", s = ".rewardwrapper", h = "-48", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "354",
                B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_sworn_sword_reward"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pro_q3_ss_blood_at_last"), g = !0, d = "ui_pro_q3_ss_blood_at_last", h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b,
                c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Click here to send <strong>Ser Hugo</strong> on this Quest."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 135, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" +
                g);
        h = "ss_action_open_quest";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_open"), g = !0, d = "ui_ss_action_open", h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) {
                if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"),
                (L = E) && E)) return !1;
            }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), doLogEvent("uiEvent: exclude_flag=flag_ss_action_tutorial"), the_val = 0, void 0 != userContext.flags.flag_ss_action_tutorial && (the_val = userContext.flags.flag_ss_action_tutorial), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("<strong>Sworn Swords</strong> can be sent to complete quest objectives. Their success depends on your skills as well as their own."), y = void 0 != b && void 0 != b.y ? b.y : -37, w = void 0 !=
                b && void 0 != b.x ? b.x : 176, z = 309, I = 100, s = "#vsbtminfo", P = "true", R = "quest_next_q3_ss_blood_at_last_tutorial_1"), doLogEvent("after checks=" + g);
        h = "quest_next_q3_ss_blood_at_last_tutorial_1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_next_q3_ss_blood_at_last_tutorial_1"), g = !0, d = "ui_quest_next_q3_ss_blood_at_last_tutorial_1", h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]",
                ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("First, select a <strong>Sworn Sword</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 15, w = void 0 != b && void 0 != b.x ? b.x : 454, z = 155, C = "left", s = ".miniviewselect", h = "12", A = -1 !=
                h.indexOf(",") ? h.split(",") : h, h = "396", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_ss_action_tutorial"), doLogEvent("after checks=" + g);
        h = "ss_choose_item_sworn_sword_hugo_temp";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_choose_item_sworn_sword_hugo_temp"), g = !0, d = "ui_ss_choose_item_sworn_sword_hugo_temp", h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " +
                h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Next, select an <strong>Action</strong> for your Sworn Sword to perform.<br>"), y = void 0 != b && void 0 != b.y ? b.y : 230, w = void 0 != b && void 0 != b.x ? b.x : 176, z = 309, C = "top, top, top", s = ".miniviewselect", h = "170, 170, 170",
                A = -1 != h.indexOf(",") ? h.split(",") : h, h = "69, 283, 492", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flags_ss_actions_show"), doLogEvent("after checks=" + g);
        h = "ss_select_action_fight, ss_select_action_sabotage, ss_select_action_bribe";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_select_action"), g = !0, d = "ui_ss_select_action", h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]", ""),
                doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Click here to send your Sworn Sword into the fray!"), y = void 0 != b && void 0 != b.y ? b.y : 240, w = void 0 != b && void 0 != b.x ? b.x : 441, z = 230, C = "left", s = "#vsbtminfo", h = "235", A = -1 != h.indexOf(",") ?
                    h.split(",") : h, h = "375", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "open_progress";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_select_action_clear_tooltips"), g = !0, d = "ui_ss_select_action_clear_tooltips", h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","),
                function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), doLogEvent("after checks=" + g);
        h = "quest_ss_results_pro_q3_ss_blood_at_last";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_display_by_id_ss_go"), g = !0, d = "ui_quest_display_by_id_ss_go",
                h = "pro_q3_ss_blood_at_last", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("<strong>Rewards</strong> for Sworn Sword Quests appear here."), y = void 0 != b && void 0 != b.y ? b.y : 200, w = void 0 !=
                    b && void 0 != b.x ? b.x : 488, z = 162, C = "left", s = "#vsbtminfo", h = "206", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "406", B = -1 != h.indexOf(",") ? h.split(",") : h, O = "true"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pro_pro_q4_a_royal_reward"), g = !0, d = "ui_pro_pro_q4_a_royal_reward", h = "pro_q4_a_royal_reward", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " +
                h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Click here to start this Quest."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 185, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ?
                h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_3option_pro_q4_a_royal_reward";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_3option_pro_q4_a_royal_reward"), g = !0, d = "ui_quest_3option_pro_q4_a_royal_reward", !0 == g && (u = subGotStrings("<strong>Alignment</strong> points are rewarded when making different choices during a quest, and can unlock special content later. "), y = void 0 !=
                b && void 0 != b.y ? b.y : -96, w = void 0 != b && void 0 != b.x ? b.x : 258, z = 336, C = "bottom_right, bottom_right", s = "#questchoicecenter", h = "45, 137", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "298, 298", B = -1 != h.indexOf(",") ? h.split(",") : h, V = "true"), doLogEvent("after checks=" + g);
        h = "quest_results_pro_q4_a_royal_reward";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_results_pro_q4_a_royal_reward"), g = !0,
                d = "ui_quest_results_pro_q4_a_royal_reward", !0 == g && (G = "royal_reward"), doLogEvent("after checks=" + g);
        h = "quest_close_pro_q4_a_royal_reward";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_quest_close_pro_q4_a_royal_reward"), g = !0, d = "ui_quest_close_pro_q4_a_royal_reward", !0 == g && (S = "chapters"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_hud_1"), g = !0, d = "ui_lore_book_hud_1", a.stat ? (doLogEvent("watch: chapter_complete_1_1: value=" + (a.stat.chapter_complete_1_1 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_1 ? parseInt(a.stat.chapter_complete_1_1) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quests_started: value=" + (a.stat.quests_started + "") + " vs. required=4"), the_val = void 0 != a.stat.quests_started ?
                parseInt(a.stat.quests_started) || 0 : 0, "4" != the_val + "" && (g = !1)) : g = !1, !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 294, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = ".chapteractionheader", h = "75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "lorebook_animation_1_end";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_description"),
                g = !0, d = "ui_lore_book_description", !0 == g && (u = subGotStrings("The <strong>Lorebook</strong> tracks your progress through the game and rewards you for completing each chapter."), y = void 0 != b && void 0 != b.y ? b.y : 154, w = void 0 != b && void 0 != b.x ? b.x : 197, z = 346, s = "#book_style", P = "true", R = "lore_book_noble"), doLogEvent("after checks=" + g);
        h = "lore_book_description_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_description_2"),
                g = !0, d = "ui_lore_book_description_2", !0 == g && (u = subGotStrings("Clicking on the green <strong>Go</strong> button next to a chapter task will open the associated content."), y = void 0 != b && void 0 != b.y ? b.y : 162, w = void 0 != b && void 0 != b.x ? b.x : 254, z = 230, s = "#book_style", P = "true", R = "lore_book_noble"), doLogEvent("after checks=" + g);
        h = "lore_book_noble";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_noble"),
                g = !0, d = "ui_lore_book_noble", !0 == g && (u = subGotStrings("<strong>Become Nobility:</strong> Accept the title of Lord or Lady and become a noble in your own right."), y = void 0 != b && void 0 != b.y ? b.y : 220, w = void 0 != b && void 0 != b.x ? b.x : 345, z = 330, C = "top", s = "#book_style", h = "150", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "469", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "chapter_claimed_1_1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_lore_book_noble_claimed"), g = !0, d = "ui_lore_book_noble_claimed", !0 == g && (C = "bottom", s = "#book_style", h = "403", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "647", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "claim_chapter_reward";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_claim_chapter_reward"), g = !0, d = "ui_claim_chapter_reward",
                doLogEvent("uiEvent: require_flag = royal_reward"), 1 != userContext.flags.royal_reward && (g = !1), !0 == g && (O = "true"), doLogEvent("after checks=" + g);
        h = "next_chapter_1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_ch_2_close"), g = !0, d = "ui_lore_book_ch_2_close", !0 == g && (C = "top_right", s = "#book_style", h = "-68", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "661", B = -1 != h.indexOf(",") ? h.split(",") :
                h, G = "flag_nobility_accepted"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pro_pro_q5_the_maesters_welcome"), g = !0, d = "ui_pro_pro_q5_the_maesters_welcome", h = "pro_q5_the_maesters_welcome", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) {
                if (activeQuest(a.quests,
                    c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1;
            }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Click here to start this Quest."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 185, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_results_pro_q5_the_maesters_welcome";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_quest_results_pro_q5_the_maesters_welcome"), g = !0, d = "ui_quest_results_pro_q5_the_maesters_welcome", !0 == g && (S = "toolbar", G = "enable_buildings"), doLogEvent("after checks=" + g);
        h = "quest_close_pro_q5_the_maesters_welcome";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_close_pro_q5_the_maesters_welcome"),
                g = !0, d = "ui_quest_close_pro_q5_the_maesters_welcome", !0 == g && (G = "flag_maester_welcome"), doLogEvent("after checks=" + g);
        h = "refresh_toolbar, click_main_toolbar";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_tab_open_web"), g = !0, d = "ui_building_tab_open_web", a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=5"), the_val = void 0 != a.stat.quests_succeeded ?
                parseInt(a.stat.quests_succeeded) || 0 : 0, "5" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("counting_house", a) && (g = !1), "web" != userContext.playerData.provider && (g = !1), !0 == g && (Q = Boolean("true"), u = subGotStrings("Click here to open the <strong>Buildings</strong> menu."), y = void 0 != b && void 0 != b.y ? b.y : -106, w = void 0 != b && void 0 != b.x ? b.x : 44, z = 173, C = "bottom", s = "#navmenubox", h = "-41", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "93", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "refresh_toolbar, click_main_toolbar";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_tab_open_frame"), g = !0, d = "ui_building_tab_open_frame", a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=5"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "5" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("counting_house", a) && (g = !1), !0 == g && (Q =
                Boolean("true"), u = subGotStrings("Click here to open the <strong>Buildings</strong> menu."), y = void 0 != b && void 0 != b.y ? b.y : -106, w = void 0 != b && void 0 != b.x ? b.x : 84, z = 173, C = "bottom", s = "#navmenubox", h = "-41", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "140", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "do_menu_select_buildings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_maester_holdings"),
                g = !0, d = "ui_quest_maester_holdings", a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=5"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "5" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructing("counting_house", a) && (g = !1), ca = !1, !0 == isBuildingConstructed("counting_house", a) && (g = !1), !0 == g && (u = subGotStrings('"First, a <strong>Counting House</strong>. We can do nothing without coin, and great houses live or die by it."'), y =
                    void 0 != b && void 0 != b.y ? b.y : -138, w = void 0 != b && void 0 != b.x ? b.x : 125, z = 264, C = "bottom_left", s = "#buildingmenubox", h = "-20", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "75", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_panel_counting_house"), g = !0, d = "ui_building_panel_counting_house",
                2 < userContext.playerData.character.level && (g = !1), !0 == isBuildingConstructed("counting_house", a) && (g = !1), !0 == g && (u = subGotStrings("The Counting House allows you to collect <strong>Silver</strong>. Silver can be used to purchase Sworn Swords, items, and building upgrades."), y = void 0 != b && void 0 != b.y ? b.y : 65, w = void 0 != b && void 0 != b.x ? b.x : 473, z = 272, C = "left", s = ".buildinginfoparchment", h = "118", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "372", B = -1 != h.indexOf(",") ? h.split(",") : h, P = "true", R = "counting_house_tutorial_1"),
                doLogEvent("after checks=" + g);
        h = "counting_house_tutorial_1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_tutorial_1"), g = !0, d = "ui_counting_house_tutorial_1", !0 == g && (u = subGotStrings("Click here to construct the <strong>Counting House</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 70, w = void 0 != b && void 0 != b.x ? b.x : -214, z = 230, C = "top_right", s = "#upgradebtn", h = "33", A = -1 != h.indexOf(",") ?
                h.split(",") : h, h = "-12", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "build_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_counting_house_speed"), g = !0, d = "ui_building_counting_house_speed", 3 < userContext.playerData.character.level && (g = !1), !0 == g && (u = subGotStrings("You can use a <strong>speed</strong> up item to finish tasks early."), y =
                void 0 != b && void 0 != b.y ? b.y : -194, w = void 0 != b && void 0 != b.x ? b.x : 381, z = 230, C = "bottom", s = ".buildinginfomid", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "462", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_counting_house_constructed", O = "true"), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_counting_house_finished"),
                g = !0, d = "ui_building_counting_house_finished", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: buildings_collected: value=" + (a.stat.buildings_collected + "") + " vs. required=0"), the_val = void 0 != a.stat.buildings_collected ? parseInt(a.stat.buildings_collected) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: require_flag = flag_counting_house_constructed"), 1 != userContext.flags.flag_counting_house_constructed && (g = !1), !0 == g && (u = subGotStrings("Your Counting House has finished construction and collected its first taxes! Click here to collect the <strong>Silver</strong>."),
                    y = void 0 != b && void 0 != b.y ? b.y : 107, w = void 0 != b && void 0 != b.x ? b.x : -52, z = 200, C = "top", s = "#collectbtn", h = "30", A = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_panel_counting_house_closebtn"), g = !0, d = "ui_building_panel_counting_house_closebtn", a.stat ? (doLogEvent("watch: buildings_collected: value=" +
            (a.stat.buildings_collected + "") + " vs. required=1"), the_val = void 0 != a.stat.buildings_collected ? parseInt(a.stat.buildings_collected) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : -30, w = void 0 != b && void 0 != b.x ? b.x : -40, C = "top_right", s = "#chartabmenu", h = "-15", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "658", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_money_tutorial_step_1"), g = !0, d = "ui_money_tutorial_step_1", 2 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: buildings_collected: value=" + (a.stat.buildings_collected + "") + " vs. required=1"), the_val = void 0 != a.stat.buildings_collected ? parseInt(a.stat.buildings_collected) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("keep", a) && (g = !1), doLogEvent("uiEvent: exclude_flag=silver_tip"),
                the_val = 0, void 0 != userContext.flags.silver_tip && (the_val = userContext.flags.silver_tip), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Your current <strong>Silver</strong> and <strong>Gold</strong> amounts are listed here. <strong>Gold</strong> can be used to purchase Premium Sworn Swords, items, talents, or upgrades.<br>"), y = void 0 != b && void 0 != b.y ? b.y : 100, w = void 0 != b && void 0 != b.x ? b.x : 440, z = 330, C = "top, top", s = "#topbar_alwaysShown", h = "34, 34", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "660, 480", B = -1 != h.indexOf(",") ?
                    h.split(",") : h, G = "silver_tip", P = "true", R = "build_keep_next"), doLogEvent("after checks=" + g);
        h = "build_keep_next";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_build_keep_next"), g = !0, d = "ui_build_keep_next", ca = !1, !0 == isBuildingConstructed("keep", a) && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"Next, we must repair the <strong>Keep</strong>. You may also wish to give it a new name--what the slavers called it I do not wish to repeat."'),
                y = void 0 != b && void 0 != b.y ? b.y : -138, w = void 0 != b && void 0 != b.x ? b.x : 205, z = 270, C = "bottom_left", s = "#buildingmenubox", h = "-23", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "158", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "constructed_keep";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_power_tutorial_1"), g = !0, d = "ui_power_tutorial_1", 2 < userContext.playerData.character.level &&
            (g = !1), a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=5"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "5" != the_val + "" && (g = !1)) : g = !1, ca = !1, doLogEvent("uiEvent: exclude_flag=flag_power_tutorial_done"), the_val = 0, void 0 != userContext.flags.flag_power_tutorial_done && (the_val = userContext.flags.flag_power_tutorial_done), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Naming your Keep has given you <strong>Power!</strong> Click here to view your current Power Ranking."),
                y = void 0 != b && void 0 != b.y ? b.y : 125, w = void 0 != b && void 0 != b.x ? b.x : -220, z = 184, C = "top_right", s = "#portraitcircle-r", h = "77", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-45", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_power_tutorial_1_holdings"), g = !0, d = "ui_power_tutorial_1_holdings", 2 < userContext.playerData.character.level &&
            (g = !1), a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=5"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "5" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("keep", a) && (g = !1), ca = !1, doLogEvent("uiEvent: exclude_flag=flag_power_tutorial_done"), the_val = 0, void 0 != userContext.flags.flag_power_tutorial_done && (the_val = userContext.flags.flag_power_tutorial_done), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Naming your Keep has given you <strong>Power!</strong> Click here to view your current Power Ranking."),
                y = void 0 != b && void 0 != b.y ? b.y : 125, w = void 0 != b && void 0 != b.x ? b.x : -220, z = 184, C = "top_right", s = "#portraitcircle-r", h = "77", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-45", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "power_modal_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_power_tutorial_2"), g = !0, d = "ui_power_tutorial_2", a.stat ? (doLogEvent("watch: quests_succeeded: value=" +
            (a.stat.quests_succeeded + "") + " vs. required=5"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "5" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("keep", a) && (g = !1), !0 == g && (u = subGotStrings('"Robert Baratheon may be king now, but every noble in Westeros plays the game of thrones, and their success is measured by <strong>Power</strong>. Nearly every decision you make is a show of strength to others."'), y = void 0 != b && void 0 != b.y ? b.y : 20, w = void 0 != b && void 0 != b.x ? b.x :
                528, z = 265, s = "#powertabmenu", P = "true", R = "power_tutorial_5", T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "power_tutorial_5";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_power_tutorial_5"), g = !0, d = "ui_power_tutorial_5", !0 == g && (u = subGotStrings("Keep your <strong>Power</strong> ranking high to unlock unique titles today and valuable rewards to come!"), y = void 0 != b && void 0 !=
                b.y ? b.y : 20, w = void 0 != b && void 0 != b.x ? b.x : 528, z = 214, s = "#powertabmenu", V = "true", X = "power_tutorial_6"), doLogEvent("after checks=" + g);
        h = "power_tutorial_6";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_power_tutorial_6"), g = !0, d = "ui_power_tutorial_6", !0 == g && (S = "render_action_items", C = "top_right", s = "#powertabmenu", h = "-21", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "571", B = -1 != h.indexOf(",") ?
                h.split(",") : h, G = "flag_power_tutorial_done"), doLogEvent("after checks=" + g);
        h = "close_power";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_power_tutorial_6_backup"), g = !0, d = "ui_power_tutorial_6_backup", !0 == g && (S = "render_action_items", s = ".infobar", G = "flag_power_tutorial_done"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h ||
            -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_holdings_quest_pro_q6_the_captain_arrives"), g = !0, d = "ui_holdings_quest_pro_q6_the_captain_arrives", h = "pro_q6_the_captain_arrives", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 ==
                activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !1 == isBuildingConstructed("keep", a) && (g = !1), !0 == g && (u = subGotStrings("Click here to start this Quest."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 135, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_results_pro_q6_the_captain_arrives";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h ||
            -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_quest_results_pro_q6_the_captain_arrives"), g = !0, d = "ui_quest_results_pro_q6_the_captain_arrives", !0 == g && (G = "flag_captain_arrives"), doLogEvent("after checks=" + g);
        h = "quest_close_pro_q6_the_captain_arrives";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_close_pro_q6_the_captain_arrives"),
                g = !0, d = "ui_quest_close_pro_q6_the_captain_arrives", !0 == g && (S = "chapters"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_hud_2"), g = !0, d = "ui_lore_book_hud_2", a.stat ? (doLogEvent("watch: chapter_complete_1_2: value=" + (a.stat.chapter_complete_1_2 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_2 ? parseInt(a.stat.chapter_complete_1_2) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quests_started: value=" + (a.stat.quests_started + "") + " vs. required=6"), the_val = void 0 != a.stat.quests_started ? parseInt(a.stat.quests_started) || 0 : 0, "6" != the_val + "" && (g = !1)) : g = !1, !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 294, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = ".chapteractionheader", h = "75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "lorebook_animation_2_end";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_background"), g = !0, d = "ui_lore_book_background", a.stat ? (doLogEvent("watch: chapter_complete_1_2: value=" + (a.stat.chapter_complete_1_2 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_2 ? parseInt(a.stat.chapter_complete_1_2) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quests_started: value=" + (a.stat.quests_started + "") +
                " vs. required=6"), the_val = void 0 != a.stat.quests_started ? parseInt(a.stat.quests_started) || 0 : 0, "6" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("<strong>Choose Background:</strong> Gain special advantages through your character\u2019s backstory."), y = void 0 != b && void 0 != b.y ? b.y : 308, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = "#book_style", h = "239", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "468", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_background_hud"), g = !0, d = "ui_lore_book_background_hud", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: chapter_complete_1_2: value=" + (a.stat.chapter_complete_1_2 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_2 ? parseInt(a.stat.chapter_complete_1_2) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: chose_background: value=" +
            (a.stat.chose_background + "") + " vs. required=0"), the_val = void 0 != a.stat.chose_background ? parseInt(a.stat.chose_background) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 294, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = ".chapteractionheader", h = "75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "chapter_claimed_1_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c,
            h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_lore_book_background_claimed"), g = !0, d = "ui_lore_book_background_claimed", !0 == g && (C = "bottom", s = "#book_style", h = "403", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "647", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "next_chapter_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_ch_3_close"),
                g = !0, d = "ui_lore_book_ch_3_close", !0 == g && (C = "top_right", s = "#book_style", h = "-68", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "661", B = -1 != h.indexOf(",") ? h.split(",") : h, O = "true"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_invite_friends_step1"), g = !0, d = "ui_invite_friends_step1", a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded +
                "") + " vs. required=6"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "6" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quest_chose_background: value=" + (a.stat.quest_chose_background + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_chose_background ? parseInt(a.stat.quest_chose_background) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, "facebook" != userContext.playerData.provider && (g = !1), doLogEvent("uiEvent: exclude_flag=friends_selector_tutoral"), the_val = 0, void 0 != userContext.flags.friends_selector_tutoral &&
            (the_val = userContext.flags.friends_selector_tutoral), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Being a new noble in Westeros is not an easy life, and you\u2019ll need allies. Invite your friends to begin the ascent to power!"), y = void 0 != b && void 0 != b.y ? b.y : 68, w = void 0 != b && void 0 != b.x ? b.x : 290, z = 260, s = "#actionmenu", V = "true", X = "ui_invite_friends_step2"), doLogEvent("after checks=" + g);
        h = "ui_invite_friends_step2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c,
            h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_invite_friends_step2"), g = !0, d = "ui_invite_friends_step2", "facebook" != userContext.playerData.provider && (g = !1), !0 == g && (S = "friends_selector", G = "friends_selector_tutoral"), doLogEvent("after checks=" + g);
        h = "send_friend_invites_modal";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_invite_friends_step3"), g = !0, d = "ui_invite_friends_step3",
                doLogEvent("uiEvent: require_flag = friends_selector_tutoral"), 1 != userContext.flags.friends_selector_tutoral && (g = !1), !0 == g && (u = subGotStrings("Invite friends to play Game of Thrones Ascent by checking the box next to their name."), w = void 0 != b && void 0 != b.x ? b.x : 13, z = 200, C = "left", s = ".friendlistwrap.friendlistright", h = "10", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-65", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "toggle_friend_checked";
        doLogEvent("trigger_src=[" + h + "] event_name=[" +
            c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_invite_friends_step4"), g = !0, d = "ui_invite_friends_step4", doLogEvent("uiEvent: require_flag = friends_selector_tutoral"), 1 != userContext.flags.friends_selector_tutoral && (g = !1), !0 == g && (u = subGotStrings("Once you are finished, click here to send invitations to the selected friends."), y = void 0 != b && void 0 != b.y ? b.y : 129, w = void 0 != b && void 0 != b.x ? b.x : 278, z = 200, C = "bottom_left", s = ".friendlistwrap.friendlistright",
                h = "245", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "222", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "toggle_friend_checked"), doLogEvent("after checks=" + g);
        h = "send_friend_invitations";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_invite_friends_step5"), g = !0, d = "ui_invite_friends_step5", !0 == g && (G = "friend_invites_sent"), doLogEvent("after checks=" + g);
        h = "send_friend_invites_modal_closed";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_invite_friends_close"), g = !0, d = "ui_invite_friends_close", a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=6"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "6" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quest_chose_background: value=" + (a.stat.quest_chose_background + "") +
                " vs. required=1"), the_val = void 0 != a.stat.quest_chose_background ? parseInt(a.stat.quest_chose_background) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: require_flag = friend_invites_sent"), 1 != userContext.flags.friend_invites_sent && (g = !1), !0 == g && (S = "render_action_items", G = "friends_selector_tutoral_done"), doLogEvent("after checks=" + g);
        h = "send_friend_invites_modal_closed";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) &&
            !0 != g)
            doLogEvent("ui triggered: ui_invite_friends_close_skipped"), g = !0, d = "ui_invite_friends_close_skipped", a.stat ? (doLogEvent("watch: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=6"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "6" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quest_chose_background: value=" + (a.stat.quest_chose_background + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_chose_background ? parseInt(a.stat.quest_chose_background) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: exclude_flag=friend_invites_sent"), the_val = 0, void 0 != userContext.flags.friend_invites_sent && (the_val = userContext.flags.friend_invites_sent), 1 == the_val && (g = !1), !0 == g && (S = "render_action_items", u = subGotStrings("If you want to invite friends later, you may do so using the Add Friends button in the Friends menu, accessed via the Main Menu."), y = void 0 != b && void 0 != b.y ? b.y : 68, w = void 0 != b && void 0 != b.x ? b.x : 290, z = 224, s = "#actionmenu", G = "friends_selector_tutoral_done",
                V = "true"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pro_pro_q7_first_impressions"), g = !0, d = "ui_pro_pro_q7_first_impressions", h = "[pro_q7bastard_first_impressions, pro_q7knight_first_impressions, pro_q7merchant_first_impressions, pro_q7foster_first_impressions, pro_q7whisperer_first_impressions, pro_q7merc_first_impressions, pro_q7noble_first_impressions]",
                K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Click here to start this Quest."), z = 185, C = "left", h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") :
                    h), doLogEvent("after checks=" + g);
        h = "quest_close_pro_q7bastard_first_impressions, quest_close_pro_q7knight_first_impressions, quest_close_pro_q7merchant_first_impressions, quest_close_pro_q7foster_first_impressions, quest_close_pro_q7whisperer_first_impressions, quest_close_pro_q7merc_first_impressions, quest_close_pro_q7noble_first_impressions";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_quest_close_first_impressions"),
                g = !0, d = "ui_quest_close_first_impressions", !0 == g && (G = "ss_npc_recruit_tutorial"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_recruit_npc_hugo"), g = !0, d = "ui_ss_recruit_npc_hugo", a.stat ? (doLogEvent("watch: num_purchase_sworn_sword: value=" + (a.stat.num_purchase_sworn_sword + "") + " vs. required=0"), the_val = void 0 != a.stat.num_purchase_sworn_sword ?
                parseInt(a.stat.num_purchase_sworn_sword) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quests_completed: value=" + (a.stat.quests_completed + "") + " vs. required=7"), the_val = void 0 != a.stat.quests_completed ? parseInt(a.stat.quests_completed) || 0 : 0, "7" != the_val + "" && (g = !1)) : g = !1, !0 == g && (S = "buildings", u = subGotStrings('"Enough parchment and scaffolding! Let\u2019s start building you an <strong>army</strong>, @address."'), y = void 0 != b && void 0 != b.y ? b.y : -138, w = void 0 != b && void 0 != b.x ? b.x : 200, z = 330,
                C = "bottom_left", s = "#buildingmenubox", h = "-23", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "158", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "ss_status_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_recruit_add"), g = !0, d = "ui_ss_recruit_add", a.stat ? (doLogEvent("watch: num_purchase_sworn_sword: value=" + (a.stat.num_purchase_sworn_sword +
                "") + " vs. required=0"), the_val = void 0 != a.stat.num_purchase_sworn_sword ? parseInt(a.stat.num_purchase_sworn_sword) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quests_completed_no_swornsword: value=" + (a.stat.quests_completed_no_swornsword + "") + " vs. required=6"), the_val = void 0 != a.stat.quests_completed_no_swornsword ? parseInt(a.stat.quests_completed_no_swornsword) || 0 : 0, "6" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("Click here to <strong>view</strong> Sworn Swords available to recruit."),
                y = void 0 != b && void 0 != b.y ? b.y : 10, w = void 0 != b && void 0 != b.x ? b.x : 253, z = 200, C = "left", s = ".addswornsword", h = "0", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "180", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "ss_status_recruit_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_recruit_hire"), g = !0, d = "ui_ss_recruit_hire", a.stat ? (doLogEvent("watch: num_purchase_sworn_sword: value=" +
            (a.stat.num_purchase_sworn_sword + "") + " vs. required=0"), the_val = void 0 != a.stat.num_purchase_sworn_sword ? parseInt(a.stat.num_purchase_sworn_sword) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (S = "buildings_redraw", u = subGotStrings("Click here to <strong>recruit</strong> this Sworn Sword into your service."), y = void 0 != b && void 0 != b.y ? b.y : 278, w = void 0 != b && void 0 != b.x ? b.x : 289, z = 200, C = "left", s = ".ssactivityboxtop", h = "293", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "214", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" +
                g);
        h = "purchase_sworn_sword_0_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_purchase_sworn_sword_0_2"), g = !0, d = "ui_purchase_sworn_sword_0_2", !0 == g && (S = "swornsword_menu", G = "ss_npc_recruited"), doLogEvent("after checks=" + g);
        h = "display_sworn_swords, holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) &&
            !0 != g)
            doLogEvent("ui triggered: ui_ss_recruit_npc_hugo_2"), g = !0, d = "ui_ss_recruit_npc_hugo_2", a.stat ? (doLogEvent("watch: num_purchase_sworn_sword: value=" + (a.stat.num_purchase_sworn_sword + "") + " vs. required=1"), the_val = void 0 != a.stat.num_purchase_sworn_sword ? parseInt(a.stat.num_purchase_sworn_sword) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) ||
                0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, ca = !1, !0 == g && (S = "refresh_sworn_swords", u = subGotStrings('"Hmph. A little green, this one. Let\u2019s get her in the field and see what she can do."'), w = void 0 != b && void 0 != b.x ? b.x : -372, z = 270, C = "right", s = ".ssactivityside", h = "20", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-78", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_sworn_sword_purchased", T = "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "ss_status_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c ==
            h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_status_tutorial_1"), g = !0, d = "ui_ss_status_tutorial_1", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_adventures_started: value=" + (a.stat.num_adventures_started + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_started ? parseInt(a.stat.num_adventures_started) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_purchase_sworn_sword: value=" +
            (a.stat.num_purchase_sworn_sword + "") + " vs. required=1"), the_val = void 0 != a.stat.num_purchase_sworn_sword ? parseInt(a.stat.num_purchase_sworn_sword) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch3: num_shop_purchases: value=" + (a.stat.num_shop_purchases + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_purchases ? parseInt(a.stat.num_shop_purchases) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("Your Sworn Sword will gain <strong>Ranks</strong> with every quest, Adventure and Player to Player action they complete successfully."),
                y = void 0 != b && void 0 != b.y ? b.y : 46, w = void 0 != b && void 0 != b.x ? b.x : 250, z = 200, C = "left", s = ".ssactivityboxtop", h = "-26", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "342", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_adventuring_tutorial", P = O = "true", R = "ss_status_tutorial_3"), doLogEvent("after checks=" + g);
        h = "ss_status_tutorial_3";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_status_tutorial_3"),
                g = !0, d = "ui_ss_status_tutorial_3", !0 == g && (u = subGotStrings('"This Sword might succeed with the clothes on her back, but she\u2019ll do better <strong>armed</strong>. Let\u2019s see what you\u2019ve got on hand..."'), y = void 0 != b && void 0 != b.y ? b.y : 96, w = void 0 != b && void 0 != b.x ? b.x : 122, z = 280, s = ".ssactivityboxtop", P = "true", R = "ss_status_tutorial_4", T = "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "ss_status_tutorial_4";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") &&
            -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_status_tutorial_4"), g = !0, d = "ui_ss_status_tutorial_4", !0 == g && (u = subGotStrings("Gear is divided into three slots: <strong>Hand</strong>, <strong>Body</strong>, and <strong>Companion</strong>. Click on any of these to equip your Sworn Sword."), y = void 0 != b && void 0 != b.y ? b.y : 75, w = void 0 != b && void 0 != b.x ? b.x : 2, z = 250, C = "bottom, bottom, bottom", s = ".ssactivityboxtop", h = "214, 214, 214", A = -1 != h.indexOf(",") ? h.split(",") : h, h =
                "14, 93, 172", B = -1 != h.indexOf(",") ? h.split(",") : h, P = "true", R = "ss_status_tutorial_7"), doLogEvent("after checks=" + g);
        h = "ss_status_tutorial_7, ss_status_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_status_tutorial_7_premature"), g = !0, d = "ui_ss_status_tutorial_7_premature", 3 < userContext.playerData.character.level && (g = !1), the_val = void 0 != a.stat.quests_completed_no_swornsword ?
                parseInt(a.stat.quests_completed_no_swornsword) || 0 : 0, 6 < parseInt(the_val) || (g = !1), a.stat ? (doLogEvent("watch2: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("The Keep serves as a recruitment and training center for your Sworn Swords. Ser Hugo will instruct you when you are ready to use the Keep."), y = void 0 != b && void 0 !=
                b.y ? b.y : 100, w = void 0 != b && void 0 != b.x ? b.x : -100, z = 250, C = "top_right", s = ".ssactivityboxtop", h = "-145", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "135", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "ss_status_tutorial_7";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_status_tutorial_7"), g = !0, d = "ui_ss_status_tutorial_7", 3 < userContext.playerData.character.level && (g =
                !1), a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quests_completed_no_swornsword: value=" + (a.stat.quests_completed_no_swornsword + "") + " vs. required=6"), the_val = void 0 != a.stat.quests_completed_no_swornsword ? parseInt(a.stat.quests_completed_no_swornsword) || 0 : 0, "6" != the_val + "" && (g = !1)) :
                g = !1, !0 == g && (u = subGotStrings("Now that you have equipped your Sworn Sword with Gear, click here to send her on an <strong>Adventure</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 175, w = void 0 != b && void 0 != b.x ? b.x : 200, z = 250, C = "left", s = ".ssactivityboxtop", h = "98", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "400", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "adventure_dialog_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_status_tutorial_9"), g = !0, d = "ui_ss_status_tutorial_9", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("<strong>Adventures</strong> are arranged based on difficulty. Click here to select your <strong>Adventure</strong>."),
                y = void 0 != b && void 0 != b.y ? b.y : 170, w = void 0 != b && void 0 != b.x ? b.x : 239, z = 200, C = "left", s = ".adventurebox", h = "174", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "140", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "start_adventure_open, ss_choose_item_sworn_sword_0_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_tutorial_1"), g = !0, d = "ui_ss_action_tutorial_1", 4 < userContext.playerData.character.level &&
            (g = !1), a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("First, select a skill: <strong>Battle</strong>, <strong>Trade</strong>, or <strong>Intrigue</strong>. Then, select the action that best suits your Sworn Sword."), y = void 0 != b && void 0 != b.y ? b.y : 145, w = void 0 != b && void 0 != b.x ? b.x : 240, z = 222,
                C = "top_left", s = ".actionselectbox", h = "136", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "170", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_equipping_ss", O = "true"), doLogEvent("after checks=" + g);
        h = "ss_action_tutorial_4";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_tutorial_4"), g = !0, d = "ui_ss_action_tutorial_4", doLogEvent("uiEvent: require_flag = flag_equipping_ss"), 1 != userContext.flags.flag_equipping_ss &&
            (g = !1), !0 == g && (u = subGotStrings("When you are finished equipping your Sworn Sword, click here to return to the <strong>Adventure</strong> screen."), y = void 0 != b && void 0 != b.y ? b.y : 15, w = void 0 != b && void 0 != b.x ? b.x : 175, z = 330, C = "left", s = ".continuebtnwrap", h = "0", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "60", B = -1 != h.indexOf(",") ? h.split(",") : h, V = "true"), doLogEvent("after checks=" + g);
        h = "pvp_select_action";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_tutorial_5"), g = !0, d = "ui_ss_action_tutorial_5", doLogEvent("uiEvent: require_flag = flag_equipping_ss"), 1 != userContext.flags.flag_equipping_ss && (g = !1), !0 == g && (u = subGotStrings("Click here to send your Sworn Sword <strong>Adventuring</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 320, w = void 0 != b && void 0 != b.x ? b.x : 455, z = 212, C = "left", s = "#vsbtminfo", h = "320", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "389", B = -1 != h.indexOf(",") ? h.split(",") : h, O = "true"), doLogEvent("after checks=" +
                g);
        h = "open_progress";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_tutorial_remove_tooltips"), g = !0, d = "ui_ss_action_tutorial_remove_tooltips", a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=0"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) || 0 : 0, "0" != the_val + "" && (g = !1)) :
                g = !1, doLogEvent("after checks=" + g);
        h = "display_sworn_swords, ss_status_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_status_open"), g = !0, d = "ui_ss_action_status_open", a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=1"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: chose_fealty: value=" + (a.stat.chose_fealty + "") + " vs. required=0"), the_val = void 0 != a.stat.chose_fealty ? parseInt(a.stat.chose_fealty) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (C = "top_right", s = "#infobar_swornswords", h = "29", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "598", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "close_modal_dialogs_top";
        doLogEvent("trigger_src=[" + h + "] event_name=[" +
            c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_action_close"), g = !0, d = "ui_ss_action_close", a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=1"), the_val = void 0 != a.stat.num_adventures_complete ? parseInt(a.stat.num_adventures_complete) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: chose_fealty: value=" + (a.stat.chose_fealty + "") + " vs. required=0"), the_val =
                void 0 != a.stat.chose_fealty ? parseInt(a.stat.chose_fealty) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (S = "chapters"), doLogEvent("after checks=" + g);
        h = "lorebook_animation_3_end";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_fealty"), g = !0, d = "ui_lore_book_fealty", a.stat ? (doLogEvent("watch: chose_fealty: value=" + (a.stat.chose_fealty +
                "") + " vs. required=0"), the_val = void 0 != a.stat.chose_fealty ? parseInt(a.stat.chose_fealty) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("<strong>Swear Fealty:</strong> Declare your allegiance to one of the Great Houses of Westeros."), y = void 0 != b && void 0 != b.y ? b.y : 351, w = void 0 != b && void 0 != b.x ? b.x : 388, z = 306, C = "top", s = "#book_style", h = "280", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "468", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_fealty_hud"), g = !0, d = "ui_lore_book_fealty_hud", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: chapter_complete_1_3: value=" + (a.stat.chapter_complete_1_3 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_3 ? parseInt(a.stat.chapter_complete_1_3) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: chose_fealty: value=" +
            (a.stat.chose_fealty + "") + " vs. required=0"), the_val = void 0 != a.stat.chose_fealty ? parseInt(a.stat.chose_fealty) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 294, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = ".chapteractionheader", h = "75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "chose_fealty";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_chose_fealty"), g = !0, d = "ui_chose_fealty", doLogEvent("after checks=" + g);
        h = "chapter_claimed_1_3";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_fealty_claimed"), g = !0, d = "ui_lore_book_fealty_claimed", a.stat ? (doLogEvent("watch: chose_fealty: value=" + (a.stat.chose_fealty + "") + " vs. required=1"), the_val = void 0 != a.stat.chose_fealty ?
                parseInt(a.stat.chose_fealty) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == g && (C = "bottom", s = "#book_style", h = "403", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "647", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "next_chapter_3";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_ch_4_close"), g = !0, d = "ui_lore_book_ch_4_close", !0 == g && (C = "top_right", s = "#book_style", h =
                "-68", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "661", B = -1 != h.indexOf(",") ? h.split(",") : h, O = "true"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pro_pro_q8_an_honored_guest"), g = !0, d = "ui_pro_pro_q8_an_honored_guest", h = "[pro_q8baratheon_an_honored_guest, pro_q8greyjoy_an_honored_guest, pro_q8lannister_an_honored_guest, pro_q8martell_an_honored_guest, pro_q8stark_an_honored_guest, pro_q8targaryen_an_honored_guest, pro_q8tyrell_an_honored_guest, pro_q8tully_an_honored_guest]",
                K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (u = subGotStrings("Click here to start this Quest."), y = void 0 != b && void 0 != b.y ? b.y : 94, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 185, C = "left", s = "#actionmenu",
                    h = "88", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_ser_hugo"), g = !0, d = "ui_ss_train_ser_hugo", a.stat ? (doLogEvent("watch: num_adventures_complete: value=" + (a.stat.num_adventures_complete + "") + " vs. required=1"), the_val = void 0 != a.stat.num_adventures_complete ?
                parseInt(a.stat.num_adventures_complete) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_trained: value=" + (a.stat.num_trained + "") + " vs. required=0"), the_val = void 0 != a.stat.num_trained ? parseInt(a.stat.num_trained) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch3: quest_enable_training: value=" + (a.stat.quest_enable_training + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_enable_training ? parseInt(a.stat.quest_enable_training) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 ==
                isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (u = subGotStrings('"The @fealty_plural are coming, eh? I want them to see veteran fighters! Let\u2019s use what your Sword learned on her adventuring to <strong>train</strong> her further."'), y = void 0 != b && void 0 != b.y ? b.y : -29, w = void 0 != b && void 0 != b.x ? b.x : -372, z = 270, C = "right", s = ".ssactivityside", h = "20", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-78", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_train_ss", T = "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "ss_status_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_1"), g = !0, d = "ui_ss_train_tutorial_1", a.stat ? (doLogEvent("watch: quest_enable_training: value=" + (a.stat.quest_enable_training + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_enable_training ? parseInt(a.stat.quest_enable_training) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_trained: value=" +
            (a.stat.num_trained + "") + " vs. required=0"), the_val = void 0 != a.stat.num_trained ? parseInt(a.stat.num_trained) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (u = subGotStrings("Click here to <strong>train</strong> your Sworn Sword."), y = void 0 != b && void 0 != b.y ? b.y : 161, w = void 0 != b && void 0 != b.x ? b.x : 386, z = 148, C = "left", s = ".ssactivitybtns", h = "77", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "400", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "ss_level_up";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_2"), g = !0, d = "ui_ss_train_tutorial_2", doLogEvent("uiEvent: require_flag = flag_train_ss"), 1 != userContext.flags.flag_train_ss && (g = !1), !0 == g && (u = subGotStrings("Select the skill you want your Sworn Sword to <strong>train</strong> in."), y = void 0 != b && void 0 != b.y ? b.y : 140, w = void 0 != b && void 0 != b.x ? b.x : 475, z = 230, s = ".alertcontents.rankselect",
                G = "flag_train_ss_modal"), doLogEvent("after checks=" + g);
        h = "ss_status_open";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_arrow_close"), g = !0, d = "ui_ss_train_tutorial_arrow_close", a.stat ? (doLogEvent("watch: quest_enable_training: value=" + (a.stat.quest_enable_training + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_enable_training ? parseInt(a.stat.quest_enable_training) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_trained: value=" + (a.stat.num_trained + "") + " vs. required=1"), the_val = void 0 != a.stat.num_trained ? parseInt(a.stat.num_trained) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (C = "top_right", s = "#infobar_swornswords", h = "29", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "600", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_ss_trained", O = "true"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_show_bldgs"), g = !0, d = "ui_ss_train_tutorial_show_bldgs", a.stat ? (doLogEvent("watch: num_trained: value=" + (a.stat.num_trained + "") + " vs. required=1"), the_val = void 0 != a.stat.num_trained ? parseInt(a.stat.num_trained) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructing("smithy", a) && (g = !1), !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g &&
            (S = "buildings"), doLogEvent("after checks=" + g);
        h = "holdings, do_menu_select_buildings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_3"), g = !0, d = "ui_ss_train_tutorial_3", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_trained: value=" + (a.stat.num_trained + "") + " vs. required=1"), the_val = void 0 != a.stat.num_trained ? parseInt(a.stat.num_trained) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructing("smithy", a) && (g = !1), !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (u = subGotStrings('"Every noble appreciates a good blade. Let\u2019s construct a <strong>Smithy</strong> and forge a gift for the @fealty_plural."'), y = void 0 != b && void 0 != b.y ? b.y : -211, w = void 0 != b && void 0 != b.x ? b.x : 122, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "180", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_ss_build_smithy", T =
                "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "building_panel_smithy";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_4"), g = !0, d = "ui_ss_train_tutorial_4", !0 == isBuildingConstructing("smithy", a) && (g = !1), !0 == isBuildingConstructed("smithy", a) && (g = !1), doLogEvent("uiEvent: require_flag = flag_ss_build_smithy"), 1 != userContext.flags.flag_ss_build_smithy && (g = !1), !0 ==
                g && (u = subGotStrings("Click here to construct the <strong>Smithy</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 197, w = void 0 != b && void 0 != b.x ? b.x : 488, z = 180, C = "top", s = ".buildinginfotop", h = "133", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "540", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_4_backtrack"),
                g = !0, d = "ui_ss_train_tutorial_4_backtrack", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=0"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"What good is an idle Smithy? Let\'s get them busy on that <strong>Decorative Blade</strong>!"'),
                    y = void 0 != b && void 0 != b.y ? b.y : -211, w = void 0 != b && void 0 != b.x ? b.x : 122, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "180", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "start_production";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_4b"), g = !0, d = "ui_ss_train_tutorial_4b", a.stat ? (doLogEvent("watch: num_trained: value=" +
            (a.stat.num_trained + "") + " vs. required=1"), the_val = void 0 != a.stat.num_trained ? parseInt(a.stat.num_trained) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (s = ".buildinginfotop"), doLogEvent("after checks=" + g);
        h = "building_panel_smithy";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_5"), g = !0, d = "ui_ss_train_tutorial_5", 3 < userContext.playerData.character.level &&
            (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=0"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy",
                a) && (g = !1), !0 == g && (u = subGotStrings("Click here to instruct the Smithy to <strong>produce</strong> an item."), y = void 0 != b && void 0 != b.y ? b.y : 100, w = void 0 != b && void 0 != b.x ? b.x : -30, z = 220, C = "top", s = "#collectbtn", h = "32", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "44", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "construct";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_6"),
                g = !0, d = "ui_ss_train_tutorial_6", a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=0"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "0" != the_val + "" && (g = !1)) : g =
                    !1, !0 == isBuildingConstructed("smithy", a) && (g = !1), doLogEvent("after checks=" + g);
        h = "building_production_tab_smithy";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_7"), g = !0, d = "ui_ss_train_tutorial_7", a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=0"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) ||
                0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), doLogEvent("uiEvent: exclude_flag=flag_show_production_item"), the_val = 0, void 0 != userContext.flags.flag_show_production_item && (the_val = userContext.flags.flag_show_production_item), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Buildings like the Smithy are used to produce <strong>items</strong> that can boost your skills or your Sworn Sword's once equipped."), y = void 0 != b && void 0 != b.y ? b.y : 162, w = void 0 != b && void 0 != b.x ? b.x : 241,
                z = 231, s = ".production", G = "flag_smithy_produce", P = "true", R = "next_ui_ss_train_tutorial_8"), doLogEvent("after checks=" + g);
        h = "next_ui_ss_train_tutorial_8";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_8"), g = !0, d = "ui_ss_train_tutorial_8", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started +
                "") + " vs. required=0"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (u = subGotStrings("Nearly every item takes <strong>time</strong>, <strong>silver</strong>, and <strong>raw materials</strong> to create. "), y = void 0 != b && void 0 != b.y ? b.y : -21, w = void 0 != b && void 0 != b.x ? b.x : 323, z = 231, C = "left", s = ".production", h = "34", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "238", B = -1 != h.indexOf(",") ?
                h.split(",") : h, P = "true", R = "next_ui_ss_train_tutorial_9"), doLogEvent("after checks=" + g);
        h = "next_ui_ss_train_tutorial_9";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_9"), g = !0, d = "ui_ss_train_tutorial_9", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=0"),
                    the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (u = subGotStrings("Click on an item to select it for <strong>production</strong>, and for material and stat details on that item."), y = void 0 != b && void 0 != b.y ? b.y : 180, w = void 0 != b && void 0 != b.x ? b.x : 40, z = 231, C = "top", s = ".production", h = "120", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "150", B = -1 != h.indexOf(",") ? h.split(",") : h, P = "true", R = "next_ui_ss_train_tutorial_10"),
                doLogEvent("after checks=" + g);
        h = "next_ui_ss_train_tutorial_10";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_10"), g = !0, d = "ui_ss_train_tutorial_10", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=0"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) ||
                0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == g && (u = subGotStrings("You have all the materials necessary for the <strong>Decorative Blade</strong>. Click here to produce the item."), y = void 0 != b && void 0 != b.y ? b.y : 409, w = void 0 != b && void 0 != b.x ? b.x : 237, z = 220, C = "right", s = ".production", h = "431", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "466", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "production_completed";
        doLogEvent("trigger_src=[" + h + "] event_name=[" +
            c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_12"), g = !0, d = "ui_ss_train_tutorial_12", a.stat ? (doLogEvent("watch: num_shop_purchases: value=" + (a.stat.num_shop_purchases + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_purchases ? parseInt(a.stat.num_shop_purchases) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == isBuildingConstructed("village_center", a) && (g = !1), !0 == g &&
            (u = subGotStrings("The Decorative Blade is ready. Click here to <strong>collect</strong> it."), y = void 0 != b && void 0 != b.y ? b.y : 83, w = void 0 != b && void 0 != b.x ? b.x : 615, z = 190, C = "top", s = ".production", h = "9", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "670", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "do_finish_production";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_12_flag"),
                g = !0, d = "ui_ss_train_tutorial_12_flag", !0 == g && (G = "decorative_blade_produced"), doLogEvent("after checks=" + g);
        h = "building_production_tab_smithy";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_12_close"), g = !0, d = "ui_ss_train_tutorial_12_close", a.stat ? (doLogEvent("watch: num_shop_purchases: value=" + (a.stat.num_shop_purchases + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_purchases ?
                parseInt(a.stat.num_shop_purchases) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_items_produced: value=" + (a.stat.num_items_produced + "") + " vs. required=1"), the_val = void 0 != a.stat.num_items_produced ? parseInt(a.stat.num_items_produced) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: require_flag = decorative_blade_produced"), 1 != userContext.flags.decorative_blade_produced && (g = !1), !0 == g && (C = "top_right", s = ".production", h = "-109", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "652", B =
                -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_12_holdings"), g = !0, d = "ui_ss_train_tutorial_12_holdings", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_purchases: value=" + (a.stat.num_shop_purchases + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_purchases ?
                parseInt(a.stat.num_shop_purchases) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_items_produced: value=" + (a.stat.num_items_produced + "") + " vs. required=0"), the_val = void 0 != a.stat.num_items_produced ? parseInt(a.stat.num_items_produced) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == isBuildingConstructed("village_center", a) && (g = !1), !0 == g && (S = "buildings", u = subGotStrings("The Smithy has finished the <strong>Decorative Blade</strong>, @address. Let's have a look."),
                y = void 0 != b && void 0 != b.y ? b.y : -211, w = void 0 != b && void 0 != b.x ? b.x : 122, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "180", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "ser_hugo"), doLogEvent("after checks=" + g);
        h = "start_production";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_tutorial_13"), g = !0, d = "ui_ss_train_tutorial_13", a.stat ? (doLogEvent("watch: num_shop_purchases: value=" +
            (a.stat.num_shop_purchases + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_purchases ? parseInt(a.stat.num_shop_purchases) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == isBuildingConstructed("village_center", a) && (g = !1), !0 == g && (G = "flag_show_production_item"), doLogEvent("after checks=" + g);
        h = "building_panel_smithy";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_maester_lucas_pre"),
                g = !0, d = "ui_ss_train_maester_lucas_pre", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "0" !=
                    the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch3: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == isBuildingConstructed("village_center", a) && (g = !1), !0 == g && (C = "top_right", s = ".infobarpattern", h = "36", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "710", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" +
                    g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_ss_train_maester_lucas"), g = !0, d = "ui_ss_train_maester_lucas", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ?
            (doLogEvent("watch2: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch3: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy",
                a) && (g = !1), !0 == isBuildingConstructing("village_center", a) && (g = !1), !0 == isBuildingConstructed("village_center", a) && (g = !1), doLogEvent("uiEvent: exclude_flag=ready_for_village_center"), the_val = 0, void 0 != userContext.flags.ready_for_village_center && (the_val = userContext.flags.ready_for_village_center), 1 == the_val && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"All nobles are impressed by coin. Let us <strong>upgrade</strong> your Counting House to increase tax revenue."'), y = void 0 != b && void 0 != b.y ? b.y : -202,
                w = void 0 != b && void 0 != b.x ? b.x : -6, z = 280, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "9", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_upgrade_counting_house", T = O = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_1"), g = !0, d = "ui_counting_house_upgrade_tutorial_1",
                4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_finished: value=" + (a.stat.building_upgrades_finished + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_finished ? parseInt(a.stat.building_upgrades_finished) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1,
                a.stat ? (doLogEvent("watch3: quests_succeeded: value=" + (a.stat.quests_succeeded + "") + " vs. required=8"), the_val = void 0 != a.stat.quests_succeeded ? parseInt(a.stat.quests_succeeded) || 0 : 0, "8" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("All buildings can be <strong>Upgraded</strong>. <strong>Upgrades</strong> can make a building produce resources more efficiently, and improve your skill in <strong>Battle</strong>, <strong>Trade</strong>, and <strong>Intrigue</strong>."), y = void 0 != b && void 0 != b.y ? b.y :
                    90, w = void 0 != b && void 0 != b.x ? b.x : 121, z = 300, s = ".upgradeinfobg", G = "flag_upgrade_counting_house_start", P = "true", R = "counting_house_upgrade_tutorial_2"), doLogEvent("after checks=" + g);
        h = "counting_house_upgrade_tutorial_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_2"), g = !0, d = "ui_counting_house_upgrade_tutorial_2", a.stat ? (doLogEvent("watch: produced_stone: value=" +
            (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: require_flag = flag_upgrade_counting_house_start"), 1 != userContext.flags.flag_upgrade_counting_house_start && (g = !1), !0 == g && (u = subGotStrings('"We will need a cut of raw <strong>Stone</strong> for this upgrade. We do not currently have any in our warehouses."'), y = void 0 != b && void 0 != b.y ? b.y : 110, w = void 0 != b && void 0 != b.x ? b.x : 194, z = 277,
                C = "left", s = ".upgradeinfobg", h = "159", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "100", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "ready_for_village_center", P = "true", R = "counting_house_upgrade_tutorial_3", T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "close_building_panel";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_close_building_panel"), g = !0, d = "ui_counting_house_close_building_panel",
                doLogEvent("uiEvent: require_flag = flag_upgrade_counting_house_start"), 1 != userContext.flags.flag_upgrade_counting_house_start && (g = !1), !0 == g && (G = "flag_counting_house_upgrade_closed"), doLogEvent("after checks=" + g);
        h = "counting_house_upgrade_tutorial_3";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_3"), g = !0, d = "ui_counting_house_upgrade_tutorial_3", doLogEvent("uiEvent: require_flag = flag_upgrade_counting_house_start"),
                1 != userContext.flags.flag_upgrade_counting_house_start && (g = !1), !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : -30, w = void 0 != b && void 0 != b.x ? b.x : -40, C = "top_right", s = "#chartabmenu", h = "-15", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "658", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_maester_lucas"),
                g = !0, d = "ui_counting_house_upgrade_maester_lucas", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=1"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) ||
                    0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == g && (S = "buildings", u = subGotStrings('"Now that we have Stone, we may now begin the <strong>upgrade</strong> to your Counting House."'), y = void 0 != b && void 0 != b.y ? b.y : -210, w = void 0 != b && void 0 != b.x ? b.x : -26, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "9", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "holdings,construction_complete_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" +
            c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_5_backtrack"), g = !0, d = "ui_counting_house_upgrade_tutorial_5_backtrack", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=1"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "1" != the_val + "" && (g = !1)) :
                g = !1, !1 == isBuildingDone("counting_house") && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"The upgrade to your Counting House is ready for your review, @address. We only need your approval to <strong>finish</strong> it."'), y = void 0 != b && void 0 != b.y ? b.y : -210, w = void 0 != b && void 0 != b.x ? b.x : -26, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "9", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_4"), g = !0, d = "ui_counting_house_upgrade_tutorial_4", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) ||
                0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=1"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: exclude_flag=flag_counting_house_upgrading"), the_val = 0, void 0 != userContext.flags.flag_counting_house_upgrading && (the_val = userContext.flags.flag_counting_house_upgrading), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Click here to construct the <strong>Stacks of Coins</strong> upgrade."),
                y = void 0 != b && void 0 != b.y ? b.y : 34, w = void 0 != b && void 0 != b.x ? b.x : 159, z = 220, C = "left", s = "#addbtn_container", h = "39", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "81", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_counting_house_upgrading", O = "true"), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_5"), g =
                !0, d = "ui_counting_house_upgrade_tutorial_5", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=1"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_finished: value=" + (a.stat.building_upgrades_finished + "") + " vs. required=0"), the_val = void 0 != a.stat.building_upgrades_finished ?
                parseInt(a.stat.building_upgrades_finished) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingDone("counting_house") && (g = !1), !0 == g && (u = subGotStrings("The Stacks of Coins upgrade is ready. Click here to <strong>finish</strong> it."), y = void 0 != b && void 0 != b.y ? b.y : 162, w = void 0 != b && void 0 != b.x ? b.x : 514, z = 224, C = "top", s = ".buildinginfotop", h = "91", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "593", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_counting_house_upgraded", O = "true"), doLogEvent("after checks=" + g);
        h = "building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_5_close"), g = !0, d = "ui_counting_house_upgrade_tutorial_5_close", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=1"), the_val = void 0 != a.stat.building_upgrades_added ? parseInt(a.stat.building_upgrades_added) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_finished: value=" + (a.stat.building_upgrades_finished + "") + " vs. required=1"), the_val = void 0 != a.stat.building_upgrades_finished ? parseInt(a.stat.building_upgrades_finished) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : -30, w = void 0 != b && void 0 != b.x ? b.x : -40, C = "top_right", s = "#chartabmenu", h = "-15", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "658", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" +
                g);
        h = "close_building_panel_counting_house";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_counting_house_upgrade_tutorial_clear"), g = !0, d = "ui_counting_house_upgrade_tutorial_clear", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: building_upgrades_added: value=" + (a.stat.building_upgrades_added + "") + " vs. required=1"), the_val = void 0 != a.stat.building_upgrades_added ?
                parseInt(a.stat.building_upgrades_added) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: building_upgrades_finished: value=" + (a.stat.building_upgrades_finished + "") + " vs. required=1"), the_val = void 0 != a.stat.building_upgrades_finished ? parseInt(a.stat.building_upgrades_finished) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) &&
            !0 != g)
            doLogEvent("ui triggered: ui_village_center_build_maester_lucas"), g = !0, d = "ui_village_center_build_maester_lucas", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ?
                parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("smithy", a) && (g = !1), !0 == isBuildingConstructing("village_center", a) && (g = !1), !0 == isBuildingConstructed("village_center", a) && (g = !1), doLogEvent("uiEvent: require_flag = ready_for_village_center"), 1 != userContext.flags.ready_for_village_center && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"If we construct a <strong>Village Center</strong>, we can produce Stone, among other resources."'), y = void 0 != b && void 0 !=
                b.y ? b.y : -209, w = void 0 != b && void 0 != b.x ? b.x : 202, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "265", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_village_center_tutorial", T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_panel_village_center_backtrack"), g = !0, d = "ui_building_panel_village_center_backtrack",
                4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("village_center",
                    a) && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"Your smallfolk sit idle, @address. Let us instruct them to produce <strong>Stone</strong> at the Village Center."'), y = void 0 != b && void 0 != b.y ? b.y : -209, w = void 0 != b && void 0 != b.x ? b.x : 202, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "265", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "building_panel_village_center";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_panel_village_center_build_prompt"), g = !0, d = "ui_building_panel_village_center_build_prompt", a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_shop_items_started: value=" + (a.stat.num_shop_items_started +
                "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == isBuildingConstructed("village_center", a) && (g = !1), !0 == g && (C = "top_right", s = "#build_village_center", h = "28", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-69", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "building_panel_village_center";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_panel_village_center_clear_tooltips"), g = !0, d = "ui_building_panel_village_center_clear_tooltips", a.stat ? (doLogEvent("watch: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=2"), the_val = void 0 != a.stat.num_shop_items_started ?
                parseInt(a.stat.num_shop_items_started) || 0 : 0, "2" != the_val + "" && (g = !1)) : g = !1, doLogEvent("after checks=" + g);
        h = "building_panel_village_center";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_building_panel_village_center_production_open"), g = !0, d = "ui_building_panel_village_center_production_open", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" +
            (a.stat.num_shop_items_started + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingConstructed("village_center", a) && (g = !1), !0 == g && (u = subGotStrings("Click here to instruct the Village Center to <strong>produce</strong> a resource."),
                y = void 0 != b && void 0 != b.y ? b.y : 110, w = void 0 != b && void 0 != b.x ? b.x : -48, z = 230, C = "top", s = "#collectbtn", h = "38", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "33", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "stone_production_item_selected";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_village_center_build_maester_tutorial_3"), g = !0, d = "ui_village_center_build_maester_tutorial_3",
                4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=1"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1, !0 == g && (u = subGotStrings("Click here to produce <strong>Stone</strong>."),
                    y = void 0 != b && void 0 != b.y ? b.y : -11, w = void 0 != b && void 0 != b.x ? b.x : -200, z = 181, C = "right", s = ".btnwrap.btnmed.equipbtn", h = "3", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "start_production";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_village_center_stone_do_production"), g = !0, d = "ui_village_center_stone_do_production", doLogEvent("uiEvent: require_flag = flag_village_center_tutorial"),
                1 != userContext.flags.flag_village_center_tutorial && (g = !1), !0 == g && (G = "flag_show_production_item", O = "true"), doLogEvent("after checks=" + g);
        h = "constructed_village_center,holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_village_center_build_maester_lucas_2"), g = !0, d = "ui_village_center_build_maester_lucas_2", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" +
            (a.stat.num_shop_items_started + "") + " vs. required=2"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "2" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingDone("village_center") && (g = !1), doLogEvent("uiEvent: exclude_flag=flag_village_center_tutorial_colleccted"), the_val = 0, void 0 != userContext.flags.flag_village_center_tutorial_colleccted && (the_val = userContext.flags.flag_village_center_tutorial_colleccted), 1 == the_val && (g = !1), !0 == g && (S = "buildings", u = subGotStrings('"The <strong>Stone</strong> you requested has been produced in the Village Center, @address."'),
                y = void 0 != b && void 0 != b.y ? b.y : -212, w = void 0 != b && void 0 != b.x ? b.x : 188, z = 270, C = "bottom", s = "#buildingmenubox", h = "-75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "265", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "building_panel_village_center";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_village_center_build_maester_tutorial_4"), g = !0, d =
                "ui_village_center_build_maester_tutorial_4", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" + (a.stat.num_shop_items_started + "") + " vs. required=2"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "2" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=0"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0,
                "0" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingDone("village_center") && (g = !1), doLogEvent("uiEvent: exclude_flag=flag_village_center_tutorial_colleccted"), the_val = 0, void 0 != userContext.flags.flag_village_center_tutorial_colleccted && (the_val = userContext.flags.flag_village_center_tutorial_colleccted), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Click here to <strong>collect</strong> the Stone."), y = void 0 != b && void 0 != b.y ? b.y : 102, w = void 0 != b && void 0 != b.x ? b.x : -40, z = 170, C = "top", s = "#collectbtn", h = "34", A = -1 !=
                h.indexOf(",") ? h.split(",") : h, h = "9", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "building_panel_village_center";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_village_center_build_maester_tutorial_4b"), g = !0, d = "ui_village_center_build_maester_tutorial_4b", 4 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: num_shop_items_started: value=" +
            (a.stat.num_shop_items_started + "") + " vs. required=2"), the_val = void 0 != a.stat.num_shop_items_started ? parseInt(a.stat.num_shop_items_started) || 0 : 0, "2" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: produced_stone: value=" + (a.stat.produced_stone + "") + " vs. required=1"), the_val = void 0 != a.stat.produced_stone ? parseInt(a.stat.produced_stone) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !1 == isBuildingDone("village_center") && (g = !1), !0 == g && (G = "flag_village_center_tutorial_colleccted"), doLogEvent("after checks=" +
                g);
        h = "do_finish_production";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_village_center_stone_do_finish_production"), g = !0, d = "ui_village_center_stone_do_finish_production", !0 == g && (G = "flag_village_center_tutorial_colleccted", O = "true"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_holdings_quest_a_feast_to_fealty"), g = !0, d = "ui_holdings_quest_a_feast_to_fealty", h = "[pro_q9baratheon_a_feast_to_the_stag, pro_q9greyjoy_a_feast_for_the_kraken, pro_q9lannister_a_feast_for_the_imp, pro_q9martell_a_feast_to_the_sun, pro_q9stark_a_feast_to_the_north, pro_q9targaryen_a_feast_for_dragons, pro_q9tyrell_a_feast_to_the_rose, pro_q9tully_a_feast_for_the_riverlands]", K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ?
            (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), !0 == g && (Q = Boolean("true"), u = subGotStrings('"@ftpe_fealty_guest has arrived, @address. Let us greet our guest properly."'), y = void 0 != b && void 0 != b.y ? b.y : 52, w = void 0 != b && void 0 != b.x ? b.x : 320, z = 320, C = "left", s = "#actionmenu", h = "88", A = -1 != h.indexOf(",") ?
                h.split(",") : h, h = "243", B = -1 != h.indexOf(",") ? h.split(",") : h, T = "true", U = "maester_lucas"), doLogEvent("after checks=" + g);
        h = "quest_close_pro_q9baratheon_a_feast_to_the_stag, quest_close_pro_q9greyjoy_a_feast_for_the_kraken, quest_close_pro_q9lannister_a_feast_for_the_imp, quest_close_pro_q9martell_a_feast_to_the_sun, quest_close_pro_q9stark_a_feast_to_the_north, quest_close_pro_q9targaryen_a_feast_for_dragons, quest_close_pro_q9tyrell_a_feast_to_the_rose, quest_close_pro_q9tully_a_feast_for_the_riverlands";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_quest_ch4_close_pro_q9"), g = !0, d = "ui_quest_ch4_close_pro_q9", !0 == g && (S = "chapters"), doLogEvent("after checks=" + g);
        h = "holdings, refresh_toolbar";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_banner_hud"), g =
                    !0, d = "ui_lore_book_banner_hud", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: chapter_complete_1_4: value=" + (a.stat.chapter_complete_1_4 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_4 ? parseInt(a.stat.chapter_complete_1_4) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: banned_saved: value=" + (a.stat.banned_saved + "") + " vs. required=0"), the_val = void 0 != a.stat.banned_saved ? parseInt(a.stat.banned_saved) || 0 : 0, "0" != the_val + "" && (g = !1)) : g = !1,
                !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 294, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = ".chapteractionheader", h = "75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "lorebook_animation_4_end";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_banner"), g = !0, d = "ui_lore_book_banner", !0 == g && (u = subGotStrings("<strong>Design Banner:</strong> Create a Banner to fly over your house and alongside House @fealty's."),
                y = void 0 != b && void 0 != b.y ? b.y : 452, w = void 0 != b && void 0 != b.x ? b.x : 395, z = 289, C = "top", s = "#book_style", h = "380", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "468", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_banner_designer_tutorial"), doLogEvent("after checks=" + g);
        h = "chapter_claimed_1_4";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_banner_claimed"), g = !0, d = "ui_lore_book_banner_claimed",
                !0 == g && (C = "bottom", s = "#book_style", h = "403", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "647", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "next_chapter_4";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_ch_5_close"), g = !0, d = "ui_lore_book_ch_5_close", !0 == g && (C = "top_right", s = "#book_style", h = "-68", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "661", B = -1 != h.indexOf(",") ?
                h.split(",") : h), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_holdings_multiple_quests_1"), g = !0, d = "ui_holdings_multiple_quests_1", a.stat ? (doLogEvent("watch: banned_saved: value=" + (a.stat.banned_saved + "") + " vs. required=1"), the_val = void 0 != a.stat.banned_saved ? parseInt(a.stat.banned_saved) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, h = "q1_meet_the_bailiff, q1_a_time_to_learn, q1_ss_a_pleasurable_task",
                K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), 3 != userContext.actions.length && (doLogEvent("num_actions_assigned: userContext.actions.length NOT 3"), g = !1), doLogEvent("uiEvent: exclude_flag=multi_quests_info"),
                the_val = 0, void 0 != userContext.flags.multi_quests_info && (the_val = userContext.flags.multi_quests_info), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("When <strong>Multiple Quests</strong> are active, you may play them in any order."), y = void 0 != b && void 0 != b.y ? b.y : 118, w = void 0 != b && void 0 != b.x ? b.x : 316, z = 200, C = "left, left, left", s = "#actionmenu", h = "90, 147, 204", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "245, 245, 245", B = -1 != h.indexOf(",") ? h.split(",") : h, V = "true", X = "multi_quests_info_close"), doLogEvent("after checks=" +
                    g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_holdings_multiple_quests_2"), g = !0, d = "ui_holdings_multiple_quests_2", a.stat ? (doLogEvent("watch: banned_saved: value=" + (a.stat.banned_saved + "") + " vs. required=1"), the_val = void 0 != a.stat.banned_saved ? parseInt(a.stat.banned_saved) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, h = "q1_meet_the_bailiff, q1_a_time_to_learn, q1_ss_a_pleasurable_task",
                K = h.replace("[", "").replace("]", ""), doLogEvent("quest_active: " + h), -1 != h.indexOf(",") ? (E = /\[.*\]/.test(h), L = !E, $.each(K.split(","), function(b, c) { if (activeQuest(a.quests, c) == E && (doLogEvent("quest_active: " + c + (E ? " IS" : " NOT") + " active"), (L = E) && E)) return !1; }), L || (g = !1)) : !1 == activeQuest(a.quests, K) && (doLogEvent("quest_active: " + K + " NOT active"), g = !1), 2 != userContext.actions.length && (doLogEvent("num_actions_assigned: userContext.actions.length NOT 2"), g = !1), doLogEvent("uiEvent: exclude_flag=multi_quests_info"),
                the_val = 0, void 0 != userContext.flags.multi_quests_info && (the_val = userContext.flags.multi_quests_info), 1 == the_val && (g = !1), !0 == g && (u = subGotStrings("Sometimes, you will receive <strong>multiple</strong> Quests. You may start and finish these Quests in any order."), y = void 0 != b && void 0 != b.y ? b.y : 85, w = void 0 != b && void 0 != b.x ? b.x : 316, z = 200, C = "left, left", s = "#actionmenu", h = "90, 147", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "245, 245", B = -1 != h.indexOf(",") ? h.split(",") : h, V = "true", X = "multi_quests_info_close"), doLogEvent("after checks=" +
                    g);
        h = "multi_quests_info_close";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_holdings_multiple_quests_close"), g = !0, d = "ui_holdings_multiple_quests_close", a.stat ? (doLogEvent("watch: banned_saved: value=" + (a.stat.banned_saved + "") + " vs. required=1"), the_val = void 0 != a.stat.banned_saved ? parseInt(a.stat.banned_saved) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == g && (G = "multi_quests_info"), doLogEvent("after checks=" +
                g);
        h = "banner";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_banner_designer_tutorial_1"), g = !0, d = "ui_banner_designer_tutorial_1", doLogEvent("uiEvent: require_flag = flag_banner_designer_tutorial"), 1 != userContext.flags.flag_banner_designer_tutorial && (g = !1), !0 == g && (u = subGotStrings("Use the controls here to <strong>customize</strong> your banner shape, pattern, colors and sigils."),
                w = void 0 != b && void 0 != b.x ? b.x : -216, z = 173, s = "#banneroptions", P = "true", R = "banner_designer_tutorial_1"), doLogEvent("after checks=" + g);
        h = "banner_designer_tutorial_1";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_banner_designer_tutorial_2"), g = !0, d = "ui_banner_designer_tutorial_2", !0 == g && (u = subGotStrings("You may also click <strong>Random</strong> as many times as you like to see random combinations."),
                y = void 0 != b && void 0 != b.y ? b.y : 389, w = void 0 != b && void 0 != b.x ? b.x : 470, z = 205, C = "bottom_left", s = "#bannerholder", h = "493", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "558", B = -1 != h.indexOf(",") ? h.split(",") : h, P = "true", R = "banner_designer_tutorial_2"), doLogEvent("after checks=" + g);
        h = "banner_designer_tutorial_2";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_banner_designer_tutorial_3"), g = !0, d = "ui_banner_designer_tutorial_3",
                !0 == g && (u = subGotStrings("Click here to <strong>save</strong> your Banner when you are finished. You may edit your Banner again at any time."), M = 7500, y = void 0 != b && void 0 != b.y ? b.y : 463, w = void 0 != b && void 0 != b.x ? b.x : 574, z = 155, C = "right", s = "#bannerholder", h = "533", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "748", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_banner_designer_tutorial_done", O = "true", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_boss_accept_q1_boss_blood_for_medicine";
        doLogEvent("trigger_src=[" + h + "] event_name=[" +
            c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: ui_boss_battle_tutorial_1"), g = !0, d = "ui_boss_battle_tutorial_1", !0 == g && (C = "top", s = ".eventrewardwrap", h = "93", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "588", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_boss_battle_tutorial_started"), doLogEvent("after checks=" + g);
        h = "quest_choose_ss_q1_boss_blood_for_medicine";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") &&
            -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_boss_battle_tutorial_2"), g = !0, d = "ui_boss_battle_tutorial_2", 5 < userContext.playerData.character.level && (g = !1), doLogEvent("uiEvent: require_flag = flag_boss_battle_tutorial_started"), 1 != userContext.flags.flag_boss_battle_tutorial_started && (g = !1), !0 == g && (u = subGotStrings("Click here to assign a Sworn Sword to this <strong>Challenge</strong>."), y = void 0 != b && void 0 != b.y ? b.y : 290, w = void 0 != b && void 0 != b.x ? b.x : 33, z = 199, C = "bottom_right",
                s = ".darkroundedbox.miniviewmenu", h = "362", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "192", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "warparty_close";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_boss_battle_tutorial_6"), g = !0, d = "ui_boss_battle_tutorial_6", 5 < userContext.playerData.character.level && (g = !1), !0 == g && (u = subGotStrings("Many Challenge quests have multiple <strong>stages</strong>. You will select Actions for each stage."),
                y = void 0 != b && void 0 != b.y ? b.y : -15, w = void 0 != b && void 0 != b.x ? b.x : 75, z = 240, C = "left", s = ".eventprogbar", h = "-23", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "13", B = -1 != h.indexOf(",") ? h.split(",") : h, G = "flag_boss_battle_tutorial_action", P = O = "true", R = "boss_battle_tutorial_8"), doLogEvent("after checks=" + g);
        h = "boss_battle_tutorial_7";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_boss_battle_tutorial_7"),
                g = !0, d = "ui_boss_battle_tutorial_7", 5 < userContext.playerData.character.level && (g = !1), doLogEvent("uiEvent: require_flag = flag_boss_battle_tutorial_action"), 1 != userContext.flags.flag_boss_battle_tutorial_action && (g = !1), !0 == g && (u = subGotStrings("Select an <strong>Action</strong> for your Sworn Sword to perform."), y = void 0 != b && void 0 != b.y ? b.y : -8, w = void 0 != b && void 0 != b.x ? b.x : 102, z = 200, s = "#bossoptions", V = "true"), doLogEvent("after checks=" + g);
        h = "boss_battle_tutorial_8";
        doLogEvent("trigger_src=[" + h + "] event_name=[" +
            c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_boss_battle_tutorial_8"), g = !0, d = "ui_boss_battle_tutorial_8", 5 < userContext.playerData.character.level && (g = !1), doLogEvent("uiEvent: require_flag = flag_boss_battle_tutorial_action"), 1 != userContext.flags.flag_boss_battle_tutorial_action && (g = !1), !0 == g && (u = subGotStrings("Actions taken by you appear in the <strong>Combat Log</strong>. The <strong>Player Chat</strong> is used to discuss strategy during the quest.."),
                y = void 0 != b && void 0 != b.y ? b.y : -7, w = void 0 != b && void 0 != b.x ? b.x : 5, z = 368, C = "bottom", s = ".stoneridge", h = "87", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "54", B = -1 != h.indexOf(",") ? h.split(",") : h, P = "true", R = "boss_battle_tutorial_7"), doLogEvent("after checks=" + g);
        h = "quest_close_q1_meet_the_bailiff, quest_close_q5_an_abrupt_end, quest_close_q1_boss_blood_for_medicine";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_pt5_end_lorebook"),
                g = !0, d = "ui_pt5_end_lorebook", a.stat ? (doLogEvent("watch: quest_q5_an_abrupt_end_complete: value=" + (a.stat.quest_q5_an_abrupt_end_complete + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_q5_an_abrupt_end_complete ? parseInt(a.stat.quest_q5_an_abrupt_end_complete) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch2: quest_ac_meet_groat: value=" + (a.stat.quest_ac_meet_groat + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_ac_meet_groat ? parseInt(a.stat.quest_ac_meet_groat) || 0 : 0, "1" != the_val +
                    "" && (g = !1)) : g = !1, a.stat ? (doLogEvent("watch3: quest_complete_q1_boss_blood_for_medicine: value=" + (a.stat.quest_complete_q1_boss_blood_for_medicine + "") + " vs. required=1"), the_val = void 0 != a.stat.quest_complete_q1_boss_blood_for_medicine ? parseInt(a.stat.quest_complete_q1_boss_blood_for_medicine) || 0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, doLogEvent("uiEvent: exclude_flag=lorebook_animated"), the_val = 0, void 0 != userContext.flags.lorebook_animated && (the_val = userContext.flags.lorebook_animated), 1 == the_val && (g = !1),
                !0 == g && (S = "chapters"), doLogEvent("after checks=" + g);
        h = "holdings";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: ui_lore_book_hud_5"), g = !0, d = "ui_lore_book_hud_5", 3 < userContext.playerData.character.level && (g = !1), a.stat ? (doLogEvent("watch: chapter_complete_1_5: value=" + (a.stat.chapter_complete_1_5 + "") + " vs. required=1"), the_val = void 0 != a.stat.chapter_complete_1_5 ? parseInt(a.stat.chapter_complete_1_5) ||
                0 : 0, "1" != the_val + "" && (g = !1)) : g = !1, !0 == g && (y = void 0 != b && void 0 != b.y ? b.y : 294, w = void 0 != b && void 0 != b.x ? b.x : 385, z = 312, C = "top", s = ".chapteractionheader", h = "75", A = -1 != h.indexOf(",") ? h.split(",") : h, h = "-4", B = -1 != h.indexOf(",") ? h.split(",") : h), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseover_realm";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: quest_alignment_realm"), g = !0, d =
                "quest_alignment_realm", !0 == g && (Q = Boolean("true"), u = subGotStrings("Choosing this response will give you <strong>Realm</strong> points. Realm means to serve Westeros above all else."), N = 300, y = void 0 != b && void 0 != b.y ? b.y : -95, w = void 0 != b && void 0 != b.x ? b.x : 334, z = 270, s = "#questbtminfo", Y = !0, Z = "icons/alignment-realm-lg.png", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseover_family";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g,
            "").split(","))) && !0 != g) doLogEvent("ui triggered: quest_alignment_family"), g = !0, d = "quest_alignment_family", !0 == g && (Q = Boolean("true"), u = subGotStrings("Choosing this response will give you <strong>Family</strong> points. Family means to consider your loved ones first."), N = 300, y = void 0 != b && void 0 != b.y ? b.y : -95, w = void 0 != b && void 0 != b.x ? b.x : 334, z = 270, s = "#questbtminfo", Y = !0, Z = "icons/alignment-family-lg.png", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseover_old_ways";
        doLogEvent("trigger_src=[" +
            h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: quest_alignment_old_ways"), g = !0, d = "quest_alignment_old_ways", !0 == g && (Q = Boolean("true"), u = subGotStrings("Choosing this response will give you <strong>Old Ways</strong> points. Old Ways means taking personal responsibility and adhering to the moral code of the Old Gods."), N = 300, y = void 0 != b && void 0 != b.y ? b.y : -95, w = void 0 != b && void 0 != b.x ? b.x : 334, z = 270, s = "#questbtminfo",
                Y = !0, Z = "icons/alignment-old_ways-lg.png", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseover_new_ways";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: quest_alignment_new_ways"), g = !0, d = "quest_alignment_new_ways", !0 == g && (Q = Boolean("true"), u = subGotStrings("Choosing this response will give you <strong>New Ways</strong> points. New Ways means being chivalrous and obeying the Seven or the new traditions of R'hllor."),
                N = 300, y = void 0 != b && void 0 != b.y ? b.y : -95, w = void 0 != b && void 0 != b.x ? b.x : 334, z = 270, s = "#questbtminfo", Y = !0, Z = "icons/alignment-new_ways-lg.png", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseover_cunning";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: quest_alignment_cunning"), g = !0, d = "quest_alignment_cunning", !0 == g && (Q = Boolean("true"), u = subGotStrings("Choosing this response will give you <strong>Cunning</strong> points. Cunning means taking advantage of opportunities and looking for ways to gain profit."),
                N = 300, y = void 0 != b && void 0 != b.y ? b.y : -95, w = void 0 != b && void 0 != b.x ? b.x : 334, z = 270, s = "#questbtminfo", Y = !0, Z = "icons/alignment-crafty-lg.png", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseover_truthfulness";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g)
            doLogEvent("ui triggered: quest_alignment_truthfulness"), g = !0, d = "quest_alignment_truthfulness", !0 == g && (Q = Boolean("true"), u = subGotStrings("Choosing this response will give you <strong>Truthful</strong> points. Truthful means acting in a straightforward way."),
                N = 300, y = void 0 != b && void 0 != b.y ? b.y : -95, w = void 0 != b && void 0 != b.x ? b.x : 334, z = 270, s = "#questbtminfo", Y = !0, Z = "icons/alignment-truthfulness-lg.png", aa = !0), doLogEvent("after checks=" + g);
        h = "quest_reward_alignment_mouseout";
        doLogEvent("trigger_src=[" + h + "] event_name=[" + c + "]");
        if ((c == h || -1 != h.indexOf(",") && -1 != $.inArray(c, h.replace(/ /g, "").split(","))) && !0 != g) doLogEvent("ui triggered: quest_alignment_mouseout"), g = !0, d = "quest_alignment_mouseout", !0 == g && (ba = !0, H = ".image_tip"), doLogEvent("after checks=" + g);
        doLogEvent("uiEvent: firing=" +
            g);
        if (userContext.pauseEventTriggers && (!userContext.pauseEventTriggers || void 0 == userContext.pauseEventTriggers)) g = !1;
        if (!0 == g) {
            if (void 0 != O) for (obj in userContext.flags = [], userContext.playerData.stat) -1 != obj.indexOf("ui_flag_") && delete userContext.playerData.stat[String(obj)];
            void 0 != G && (doLogEvent("uiEvent: set_flag = " + G), userContext.flags[G] = !0);
            doLogEvent(" trigger_src=" + h + " event_name=" + c);
            userContext.tooltipsEnabled = ca;
            if (!1 == Q && void 0 == H && ($(".tuttip, .tuttip.tipbox").remove(), $(".tutarrow_wrap").remove(),
                ba) || void 0 != H && (0 == M ? $(H).remove() : $(H).fadeOut(M, function() { $(this).remove(); }), ba)) return;
            void 0 != S && doMenuSelect(S);
            void 0 != p && dialogAlert({ style: "alert", text: p, heading: f, button1: m, symbol: D, image: void 0, image_width: void 0 });
            void 0 != q && iosSignal(q, k);
            if (void 0 != u || void 0 != C) {
                void 0 == u && (u = "");
                doLogEvent("uiEvent: display text: " + u);
                var J = "", fa = void 0, da = void 0, ha = [];
                b = "tuttip";
                g = "block";
                p = "auto";
                void 0 != C && -1 != C.indexOf(",") && (C = C.replace(/ /g, "").replace(/"/g, "'").split(","));
                "number" != typeof A &&
                    -1 != A.indexOf(",") && (A = A.split(","));
                "number" != typeof B && -1 != B.indexOf(",") && (B = B.split(","));
                if (0 < N || "" == u) g = "none";
                0 < I && (p = I + "px");
                T ? b += " tipbox" : Y && (b += " tipbox image_tip");
                aa && (b += " tip_high");
                J += '<div id="tip_' + d + '" class="' + b + '" style="width:' + z + "px; height: " + p + "; top: " + y + "px; left: " + w + "px; display: " + g + '">';
                !T && (!Y && "" != u) && (J += '<span class="tuttipbg"></span><p>' + u);
                void 0 != P && void 0 == T && (void 0 == R && console.warn("Next button tooltip specified with no Next button click handler!"), J += '<span class="btnwrap btnmed nextbtn" id="tip_next" onclick="uiEvent(\'' +
                    R + '\'); return false;"><span class="btnedge"><a class="btnbrown"><span></span>More</a></span></span>');
                void 0 != V && (void 0 == X ? (y = "confirm_override", console.warn("Confirm button tooltip specified with no Confirm button click handler. The button will only remove the tooltip.")) : y = X, J += '<span class="btnwrap btnmed nextbtn" id="tip_ok" onclick="uiEvent(\'' + y + '\'); return false;"><span class="btnedge"><a class="btnbrown"><span></span>Ok</a></span></span>');
                void 0 != T && (void 0 == U ? console.warn("NPC portrait for tooltip has no NPC specified.") :
                (J += "<em></em>", J += '<div class="chapternpcbg">', J += '\t<div class="chapternpcbox">', J += '\t\t<div class="chapternpcpic">', J += '\t\t\t<img id="tooltip_npc' + U + '" src= "' + getToolTipNpc(U).img + '" />', J += '\t\t\t<div class="chapternpcframe"></div>', J += "\t\t</div>", J += '\t\t<div class="chapternpctxt pic">', J += "\t\t\t<h6>" + getToolTipNpc(U).npc_name + "</h6>", J += "\t\t\t<p>" + u + "</p>", P && R && (J += '\t<span class="btnwrap btnmed nextbtn" id="tip_next" onclick="uiEvent(\'' + R + '\'); return false;"><span class="btnedge"><a class="btnbrown"><span></span>More</a></span></span>'),
                    J += "\t\t</div>", J += "\t</div>", J += "</div>"));
                Y && (void 0 == Z ? console.warn("Image for tooltip for event " + c + " has no path specified.") : (J += "<em></em>", J += '<div class="chapternpcbg">', J += '\t\t<div class="chapternpcpic" style="width: 72px; height: 70px">', J += '\t\t\t<img id="tooltip_npc" src= "' + assetUrl() + "/images/" + Z + '" style="width: 72px; height: 70px" />', J += "\t\t</div>", J += '\t\t<div class="chapternpctxt pic">', J += "\t\t\t<p>" + u + "</p>", P && R && (J += '\t<span class="btnwrap btnmed nextbtn" id="tip_next" onclick="uiEvent(\'' +
                    R + '\'); return false;"><span class="btnedge"><a class="btnbrown"><span></span>More</a></span></span>'), J += "\t\t</div>", J += "\t</div>", J += "</div>"));
                var J = J + "</div>",
                    ga = function(a) {
                        switch (void 0 == a ? C : C[a]) {
                        case "left":
                            return "tutarrowl";
                        case "right":
                            return "tutarrowr";
                        case "top":
                            return "tutarrowt";
                        case "bottom":
                            return "tutarrowb";
                        case "bottom_left":
                            return "tutarrowbl";
                        case "bottom_right":
                            return "tutarrowbr";
                        case "top_right":
                            return "tutarrowtr";
                        case "top_left":
                            return "tutarrowtl";
                        }
                    },
                    ia = function(a, b, c, f) {
                        if (void 0 !=
                            a) return f = "arrow_" + d + "_" + a + "_" + f, J += '<div class="tutarrow_wrap ' + a + '" style="', 0 != c && (J += "left: " + c + "px; "), 0 != b && (J += "top: " + b + "px;"), J += '"> <img src="/images/buttons/tutarrow.png" id="' + f + '"  class="tutarrow" width="70" height="70" /> </div>', f;
                    };
                $.isArray(C) ? $.each(C, function(a, b) { void 0 != ga(a) && (ga(a), da = C[a], fa = ia(da, A[a], B[a], a), ha.push([fa, da])); }) : (ga(), da = C, fa = ia(da, A, B, 0), ha.push([fa, da]));
                doLogEvent("DBG: CURRENT DOM length=" + $(s));
                $(s).prepend(J);
                setTimeout(function() {
                    0 == $("#tip_" + d).length &&
                    (ea = setInterval(function() { 1 == $(s).length && (clearInterval(ea), $(s).prepend(J)); }, 500));
                }, 500);
                0 < N && $("#tip_" + d).fadeIn(N);
                0 < M && ($("#tip_" + d).delay(M).fadeOut("fast", function() { uiEvent(W, a); }), $.isArray(C) ? $.each(C, function(a, b) { $("#arrow_" + a + "_" + d).delay(M).fadeOut("fast"); }) : $("#arrow__" + d).delay(M).fadeOut("fast"));
            }
        }
    } else isIpad() && 200 > mobileVersion ? uiEventSignalLegacy(c) : uiEventSignal(c);
};
log("Start analyzing user interface event function.", "initialize");

doAdventure = function doAdventure(c, a, b, callback) {
    //console.debug("First passed parameter: ", c);
    // EXTENDER : Modfification
    if (userContext.setSwornSword && userContext.setSwornSword.damage && userContext.setSwornSword.damage == 4) {
        warn("Sworn sword has 4 wounds. Adventure will not continue.");
        return;
    }

    //console.debug("Logging parameters of doAdventure: ", c, a, b);

    if (void 0 != userContext.setSwornSword && void 0 != userContext.setSwornSword.batch_type && 0 != userContext.setSwornSword.batch_type)
        return 1 == userContext.setSwornSword.batch_type && (!1 == b && prepareAdvPartyTimeout(), $.ajax({
            url: "/play/batch_set_sworn_sword_target?batch_type=1&ss_id=" + userContext.setSwornSword.id + "&batch_action=" + a + "&target_symbol=" + c,
            dataType: "JSON",
            success: function(a) {
                questClose();
                showAdvPartyResponse(a);
                uiEvent("ss_adventure_party");
                return !0;
            },
            error: function(b) {
                400 ==
                    b.status ? advPartyFail() : 409 == b.status ? setTimeout(function() { doAdventure(c, a, !0); }, 5E3) : spinTimeout();
            }
        })), !1;
    $.ajaxQueue({
        url: "/play/adventure/" + userContext.setSwornSword.id + "?action_name=" + a + "&symbol=" + c,
        dataType: "JSON",
        success: function(b) {
            //analytics.track("Adventure Start", { adventure_region: b.location, adventure_action: a, adventure_swornsword_id: userContext.setSwornSword.id, adventure_swornsword_level: userContext.setSwornSword.ugprade_level });
            //analytics.wizardtrack("Adventure Start", {
            //    adventure_region: b.location,
            //    adventure_action: a,
            //    adventure_swornsword_id: userContext.setSwornSword.id,
            //    adventure_swornsword_level: userContext.setSwornSword.ugprade_level
            //});

            if (b.symbol) {
                adventureProgress(userContext.setSwornSword.id, b);
                uiEvent("do_adventure");
                "1" == userContext.playerData.stat.onboarding_ftue && uiTelemetry("ss_adventure");
            }

            // EXTENDER :: Modification                        
            if (typeof callback == "function") {
                userContext.setSwornSword.not_on_adventure = !b.symbol;

                callback(!b.symbol);
            }
        }
    });
};
log("Don't do adventure if sworn sword is about to die. Call callback when ready (bruting).", "initialize");

playSound = function playSound(a, d) {
    if (!1 != doSound())
        if ($.browser.msie || doLog("playSound [1]: " + a), !1 == soundEnabled) $.browser.msie || doLog("playSound [1]: sound disabled");
        else {
            void 0 == d && (d = 0);
            musicMuted = userContext.mute_music;
            soundMuted = userContext.mute_sound;
            try {
                if (-1 != a.indexOf("voice-") && ($.browser.msie || doLog("play voiceover"), soundMapChannel[a] = "voice"), theUrl = soundMap[a], void 0 == soundMapChannel[a] && (soundMapChannel[a] = "channel1"), isWeb()) {
                    if ($.browser.msie || doLog("playSound[2]: " +
                        a + " soundReady=" + soundReady), !0 == soundReady) {
                        $.browser.msie || doLog("soundReady: " + soundMapChannel[a]);
                        play_it = !0;
                        if ("music" == soundMapChannel[a]) {
                            if (0 == musicVolume || !0 == musicMuted) play_it = !1;
                            vol = musicVolume;
                            $.browser.msie || doLog("MUSIC vol=" + vol);
                        } else {
                            if (0 == soundVolume || !0 == soundMuted) play_it = !1;
                            vol = soundVolume;
                            $.browser.msie || doLog("SOUND vol=" + vol);
                        }
                        if ("channel1" == soundMapChannel[a] || "channel2" == soundMapChannel[a] || "channel3" == soundMapChannel[a] || "channel4" == soundMapChannel[a] ||
                            "channel5" == soundMapChannel[a] || "music" == soundMapChannel[a] || "voice" == soundMapChannel[a] || "voice2" == soundMapChannel[a])
                            if (!0 == soundChannel[soundMapChannel[a]]) $.browser.msie || doLog("Sound channel busy: " + soundMapChannel[a] + " playing=" + soundActive[a]), "music" == soundMapChannel[a] && currentMusic != a && (doLog("switch to new music"), soundCrossFade("music", vol, function() { playSound(a, d); }));
                            else if (sound_url = assetUrl() + theUrl, $.browser.msie || doLog("SOUND: play_it=" + play_it), !0 != play_it)
                                $.browser.msie ||
                                    doLog("SOUND: returning");
                            else {
                                "music" == soundMapChannel[a] && (doLog("currentMusic = " + currentMusic), currentMusic = a);
                                $.browser.msie || doLog("SOUND: createSound");
                                soundObject = soundManager.createSound({
                                    id: soundMapChannel[a],
                                    url: theUrl,
                                    volume: vol,
                                    onfinish: function() {
                                        $.browser.msie || doLog("soundObject.onfinish: id=" + a + " soundMapChannel=" + soundMapChannel[a]);
                                        soundChannel[soundMapChannel[a]] = !1;
                                        soundManager.destroySound(soundMapChannel[a]);
                                        "music" == soundMapChannel[a] && (0 < musicVolume && !0 !=
                                            userContext.mute_music) && playSound(a);
                                    }
                                });
                                if (null == soundObject || void 0 == soundObject) $.browser.msie || doLog("soundObject: invalid");
                                !0 == play_it && (soundChannel[soundMapChannel[a]] = !0, soundActive[soundMapChannel[a]] = sound_url, soundManager.getSoundById(soundMapChannel[a]).setVolume(vol), 0 < d ? setTimeout(soundObject.play, d) : ($.browser.msie || doLog("soundObject.play: [" + soundMapChannel[a] + "] " + soundActive[soundMapChannel[a]]), soundObject.play()));
                            }
                        else
                            0 < vol && ($.browser.msie || doLog("playing [3]: [" +
                                soundMapChannel[a] + "] vol=" + vol), soundManager.getSoundById(soundMapChannel[a]).setVolume(vol), soundManager.getSoundById(soundMapChannel[a]).volume = vol, soundManager.play(a));
                    }
                } else iosSignal("playsound", soundMapChannel[a] + ":" + soundMap[a].substring(soundMap[a].lastIndexOf("/") + 1) + ":" + d);
            } catch (e) {
                $.browser.msie || doLog("playSound exception: " + e);
            }
        }
};
log("Cleared playSound from console logging.", "initialize");

submitWorldEventAction = function submitWorldEventAction(c, a, b) {
    console.debug("Submitting world event action, " +
        "sworn sword id: " + c + ", order: " + a + ", weakness attack? " + b);

    showSpinner();
    data = { sworn_sword_id: c, order: a };
    !0 == b && (data.weakness_attack = b);
    $.ajax({
        url: "/play/world_event_attack",
        data: data,
        complete: function() {
            hideSpinner();
        },
        success: function(a) {
            console.debug("Logging response from the server for sending the sworn sword: ", b);

            hideSpinner();
            a.error && doAlert("Error Sending Swornsword", formatWorldEventError(a.error, a.error_code));
            a.swornsword && (insertInventoryFromItem(userContext.playerData.inventory, a.swornsword), doItemCooldown(a.swornsword));
            a.challenge && updateWorldEventChallenge(a.challenge);
            !0 == a.show_outmaneuver_alert &&
                dialogAlert({ style: "alert", text: "The order you just sent is guaranteed to critically hit and will have a bonus chance to find a weakness.", heading: "", button1: "Okay" });
        }
    });
};
log("Analyzing world event action.", "initialize");

getWorldEventAttackResults = function getWorldEventAttackResults(c, a, loop) {
    console.debug("Getting world event attack result, " +
        "sworn sword id: " + c + ", refresh? " + a + " and then loop? " + loop);

    showSpinner();
    $.ajax({
        url: "/play/world_event_attack_results",
        data: { sworn_sword_id: c },
        complete: function() {
            hideSpinner();
        },
        success: function(b) {
            hideSpinner();

            console.debug("Logging response from the server from world event attack: ", b);
            console.debug("Got response, repeat event condition: " +
                "loop? " + loop + ", response contains sworn sword? " + (b.swornsword) + ", response contains an action parameter? " + (b.action));

            if (loop && b.swornsword && b.action) {
                submitWorldEventAction(b.swornsword.id, b.action, false);
                console.debug("Submit a new world event action with parameters: ", b.swornsword.id, b.action, false);
            }

            b.error
                ? doAlert("Error Getting Results", formatWorldEventError(b.error, b.error_code))
                : (b.swornsword && (insertInventoryFromItem(userContext.playerData.inventory, b.swornsword), doItemCooldown(b.swornsword)),
                    b.character && (userContext.playerData.stat.level_progress = b.xp_after, userContext.playerData.character = b.character,
                        infoBar(userContext.playerData, userContext.playerData.inventory)), isWeb() ? (b = _.template('<div class="modalbg"></div><div class="contentframe1" style="top:44px; z-index:22;"><div class="contentframe2"><div class="contentframe3"><div class="contentframe4"><span class="corner tl"></span><span class="corner tr"></span><a class="closebtn" onclick="closeWorldEventAttackResults();">close</a>    <h2 class="alertheader"><%= translateString(\'we_order_completed\') %></h2>    <div class="alertcontents">    <div class="alertbox">      <div class="alertboxinner">        <div class="weinforow">          <%= itemMiniView(data.swornsword) %>          <% if(data.wounds > 0) { %>            <div class="orderwound">Wounded</div>          <% } %>          <div class="bossopttop">            <div class="bossoptbtn">              <span class="btnwrap btnlg"><span class="btnedge"><a class="btnbrown"> \x3c!-- Selected button is brown --\x3e              <span><img src="<%= assetUrl() %>/images/content/talent/<%=data.action%>.png" /></span>              <strong><%= translateString(data.action) %></strong>              <em><%= data.label %></em>            </a></span></span>            <div class="challengebar">              <div class="challengeicon"></div>                <div class="challenge-outer challengelose">                  <div style="width:<%= data.cr %>%;" class="challenge-yours"></div>                  <div style="width:<%=100 - data.cr%>%;" class="challenge-target"></div>                </div>              </div>            </div>          </div>        </div>                <% if(data.outcome > 0) { %>          <h3 class="challengerewardhead-success">Success!</h3>        <% } else { %>          <h3 class="challengerewardhead-lose">Failure!</h3>        <% } %>        <div class="weinforow orderresult">          <p><%= data.damage %> Damage Dealt</p>          <% if(data.xp_after > data.xp_before) { %>            <%= xpReward(data.xp_before, data.xp_after) %>          <% } %>        <div class="weinforow">          <div class="weinfo"><%= data.text %></div>        </div>      </div>      </div>    </div>  </div>    <div class="alertbtm">    <% if(data.can_repeat) { %>      <span class="btnwrap btnlg" onclick="submitWorldEventAction(<%=data.swornsword.id%>,\'<%=data.action%>\');closeWorldEventAttackResults();"><span class="btnedge"><a class="btngold">Repeat</a></span></span>    <% } %>    <span class="btnwrap btnlg" onclick="closeWorldEventAttackResults();"><span class="btnedge"><a class="btngold">Close</a></span></span>  </div></div></div></div></div>',
                    { data: b }), $(".weordercomplete").html(b).show()) : iosSignal("we", "viewSSResult", b), a && refreshWorldEventChallenge());
        }
    });
};
log("Logging information from world event action.", "initialize");

charCharacterTab = function charCharacterTab() {
    $(".lineage").hide();
    playerData = userContext.focusData;
    //console.debug("Logging player data: ", playerData);
    markup = "";
    markup += '\t\t\t\t<div class="stoneridge" id="charactertop">';
    markup += '\t\t\t\t\t<div class="left35">';
    markup += '\t\t\t\t\t\t<div class="charframe">';
    markup += '\t\t\t\t\t\t\t<div class="portraitimage"><img src="' + playerData.portrait_pic + '" /></div>';
    markup += '\t\t\t\t\t\t\t<div id="character_sheet_portrait" class="charframe-lg"></div>';

    // EXTENDER :: Modification
    markup += formatStats(playerData.got_battle, playerData.got_trade, playerData.got_intrigue, playerData.level);

    0 < playerData.id && playerData.id == userContext.playerData.character.id && (markup +=
        '\t\t\t\t\t\t\t<a class="lineagebtn" onclick="lineageIncarnationsPage();"></a>');
    markup += "\t\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t\t<div class="charnameoverlay">';
    if (userContext.focusData.user_id == userContext.playerData.character.user_id) {
        var c = playerData.title + " ";
        if ("male" == userContext.playerData.strings.gender) {
            if (1 < userContext.playerData.strings.eligible_titles_male.length) {
                c = "";
                markup += '\t\t\t\t\t\t\t<div class="selectwrap">';
                markup += "\t\t\t\t\t\t\t\t<select id=\"selecttitle\" onchange=\"$('#portrait_name > em').html($('#selecttitle').val());return setTitle('selecttitle',characterModal);\">";
                for (var a = 0; a < userContext.playerData.strings.eligible_titles_male.length; a++) selected = "", playerData.title == userContext.playerData.strings.eligible_titles_male[a].title && (selected = "selected"), markup += "<option " + selected + ">" + userContext.playerData.strings.eligible_titles_male[a].title + "</option>";
                markup += "\t\t\t\t\t\t\t\t</select>";
                markup += "\t\t\t\t\t\t\t</div>";
            }
        } else if ("female" == userContext.playerData.strings.gender && 1 < userContext.playerData.strings.eligible_titles_female.length) {
            markup += '\t\t\t\t\t\t\t<div class="selectwrap">';
            markup += "\t\t\t\t\t\t\t\t<select id=\"selecttitle\" onchange=\"$('#portrait_name > em').html($('#selecttitle').val());return setTitle('selecttitle',characterModal);\">";
            c = "";
            for (a = 0; a < userContext.playerData.strings.eligible_titles_female.length; a++) selected = "", playerData.title == userContext.playerData.strings.eligible_titles_female[a].title && (selected = "selected"), markup += "<option " + selected + ">" + userContext.playerData.strings.eligible_titles_female[a].title + "</option>";
            markup += "\t\t\t\t\t\t\t\t</select>";
            markup += "\t\t\t\t\t\t\t</div>";
        }
        markup += "\t\t\t\t\t\t\t<h3><em>" + c + "</em>" + playerData.name + "</h3>";
        markup += "\t\t\t\t\t\t</div>";
        markup += "\t\t\t\t\t</div>";
        markup += '\t\t\t\t\t<div class="center30">';
        markup += '\t\t\t\t\t\t<div class="holdingsname">';
        playerData.holdings && (markup += "\t\t\t\t\t\t\t<h3>Holdings:</h3>", markup += '\t\t\t\t\t\t\t<input id="holdings_name" type="text" value="' + playerData.holdings + '" onchange="renameHoldings();"/>');
    } else
        markup += '                         <span class="btnwrap btnmed" id="ptpbtn" style="position: absolute; top: -200px; width: 200px; left: -10px"><span class="btnedge"><a class="btnbrown" onclick="return pvpStartWithTarget(' +
                playerData.id + ');"><span></span>Player to Player</a></span></span>', markup += '                         <span class="btnwrap btnmed frnd-none" id="friendbtn" style="display:none;"><span class="btnedge"><a class="btnbrown" onclick="$(\'.frnd-none\').fadeOut(\'slow\',function(){ $(\'.frnd-pending\').show(); });friendSendRequest(' + playerData.user_id + ');"><span></span>Add</a></span></span>', markup += '                         <span class="btnwrap btnmed frnd-friends" id="friendbtn" style="display:none;"><span class="btnedge"><a class="btnbrown" onclick="$(\'.frnd-friends\').fadeOut(\'slow\',function(){ $(\'.frnd-none\').show(); });friendRemove(' +
                playerData.user_id + ');"><span></span>Remove</a></span></span>', markup += '                         <span class="btnwrap btnmed frnd-pending" id="friendbtn" style="display:none;"><span class="btnedge"><a class="btnbrown"><span></span>Pending</a></span></span>', c = playerData.title_and_name, c = c.replace(playerData.title, "<em>" + playerData.title + "</em>"), c = c.replace(playerData.name, "<h3>" + playerData.name + "</h3>"), markup += c, markup += "\t\t\t\t\t\t</div>", markup += "\t\t\t\t\t</div>", markup += '\t\t\t\t\t<div class="center30">',
            markup += '\t\t\t\t\t\t<div class="holdingsname">', markup += "\t\t\t\t\t\t\t<h3>Holdings:</h3>", markup += "\t\t\t\t\t\t\t<h2>" + playerData.holdings + "</h2>";
    markup += "\t\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t\t<div class="reviewfealty">\t';
    void 0 != playerData.fealty && (markup += '                         <div class="reviewcircle">', markup += '                             <a class="icon-book" onclick="lorePage(\'house_' + playerData.fealty.toLowerCase() + "')\"></a>", markup += '                             <img style="margin: 7px" img src="' +
        assetUrl() + "/images/banner-" + playerData.fealty.toLowerCase() + '-lg.png?t=b8e2c654bf59"></img>', markup += "                         </div>");
    markup += "\t\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t    <div class="reviewbackground">\t';
    void 0 != playerData.background_option && (markup += '\t\t\t\t\t\t\t<div class="reviewcircle ' + playerData.background_option + '">', markup += '\t\t\t\t\t\t\t\t<a class="icon-book" onclick="lorePage(\'background-' + playerData.background_option + "');\"></a>", markup += "\t\t\t\t\t\t\t</div>");
    markup +=
        "\t\t\t\t\t\t</div>";
    userContext.focusData.user_id != userContext.playerData.character.user_id && (markup += '\t\t\t\t\t\t<div class="charequipment">', markup += "\t\t\t\t\t\t\t<h3>Equipment</h3>", markup = null == playerData.weapon ? markup + '\t\t\t\t\t\t<div class="iconview iconview-weapon" ></div>' : markup + itemIconView(playerData.weapon, "inventoryDisplayStatsWithTab", "iconview-weapon"), markup = null == playerData.armor ? markup + '                     <div class="iconview iconview-armor" ></div>' : markup + itemIconView(playerData.armor,
        "inventoryDisplayStatsWithTab", "iconview-armor"), markup = null == playerData.companion ? markup + '                     <div class="iconview iconview-companion" ></div>' : markup + itemIconView(playerData.companion, "inventoryDisplayStatsWithTab", "iconview-companion"), markup += "\t\t\t\t\t\t</div>", markup += '<span class="btnwrap btnlg" style="position: relative; left: -285px; margin-top: 230px; z-index: 1" onclick="return contactPlayer(' + playerData.id + ",'" + escape(playerData.name) + '\')"><span class="btnedge"><a class="btngold"><span></span>Send a Raven</a></span></span>');
    playerData.alliance_name && (markup += '\t\t\t\t\t\t\t<div style="position:relative; top:-30px; z-index: 1"><h3>Alliance:</h3>', markup += '\t\t\t\t\t\t\t<a href="#" onclick="return allianceInfo(' + playerData.alliance_id + ')">' + playerData.alliance_name + "</a></div>");
    markup += "\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t<div class="right35">';
    markup += '\t\t\t\t\t\t<div class="charframe">';
    markup += '\t\t\t\t\t\t\t<div class="portraitimage"></div>';
    markup += '\t\t\t\t\t\t\t<div class="charframe-lg"></div>';
    markup += '\t\t\t\t\t\t\t<div class="charbanner-lg" style="margin-left: -7px;"><img src="' +
        playerData.banner + '" /></div>';
    markup += '\t\t\t\t\t\t\t<div class="bannerpole-lg"></div>';
    userContext.focusData.user_id == userContext.playerData.character.user_id && (markup += '\t\t\t\t\t\t\t<div class="editbanneroverlay">', markup += '\t\t\t\t\t\t\t\t<span class="btnwrap btnmed" id="editbtn"><span class="btnedge"><a class="btnbrown" onclick="return bannerDesigner();"><span></span>Edit</a></span></span>', markup += "\t\t\t\t\t\t\t</div>");
    markup += "\t\t\t\t\t\t</div>";
    markup += "\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t<div class="stoneridgebtm"></div>';
    markup += "\t\t\t\t</div>";
    markup += '\t\t\t\t<div class="chargenbox" id="alignment">';
    markup += '\t\t\t\t\t<div class="marbletop oldways realm crafty">';
    markup += "\t\t\t\t\t\t<h3>Alignment</h3>";
    markup += '\t\t\t\t\t\t<div class="alignmenttabs">';
    markup += "\t\t\t\t\t\t\t<a id=\"alignmenttab-tradition\" class=\"active\" onclick=\"$(this).siblings().removeClass('active');$(this).addClass('active');$('.alignmentbar').hide();$('#alignmentbar-tradition').show();\" onmouseover=\"return doTip('tip_alignment_tradition',function(){return renderAlignmentTip('tradition')});\" onmouseout=\"return noTip('tip_alignment_tradition');\"><span></span><em></em></a>";
    markup += "\t\t\t\t\t\t\t<a id=\"alignmenttab-duty\" onclick=\"$(this).siblings().removeClass('active');$(this).addClass('active');$('.alignmentbar').hide();$('#alignmentbar-duty').show();\" onmouseover=\"return doTip('tip_alignment_duty',function(){return renderAlignmentTip('duty')});\" onmouseout=\"return noTip('tip_alignment_duty');\"><span></span><em></em></a>";
    markup += "\t\t\t\t\t\t\t<a id=\"alignmenttab-integrity\" onclick=\"$(this).siblings().removeClass('active');$(this).addClass('active');$('.alignmentbar').hide();$('#alignmentbar-integrity').show();\" onmouseover=\"return doTip('tip_alignment_integrity',function(){return renderAlignmentTip('integrity')});\" onmouseout=\"return noTip('tip_alignment_integrity');\"><span></span><em></em></a>";
    markup += "\t\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t\t<div id="alignmentbar-tradition" class="alignmentbar">';
    markup += "\t\t\t\t\t\t\t<div class=\"alignmenticon-left\" onmouseover=\"return doTip('tip_alignment_old_ways',function(){return renderAlignmentTip('old_ways')});\" onmouseout=\"return noTip('tip_alignment_old_ways');\"></div>";
    markup += "\t\t\t\t\t\t\t<div class=\"alignmenticon-right\" onmouseover=\"return doTip('tip_alignment_new_ways',function(){return renderAlignmentTip('new_ways')});\" onmouseout=\"return noTip('tip_alignment_new_ways');\"></div>";
    markup += '\t\t\t\t\t\t\t<div class="aligncenter"></div>';
    markup += '\t\t\t\t\t\t\t<div class="alignbar-left" style="width:30%;"><span></span></div>';
    markup += '\t\t\t\t\t\t\t<div class="alignbar-right" style="width:5%;"><span></span></div>';
    markup += '\t\t\t\t\t\t\t<p class="aligntext-left">Old Ways</p>';
    markup += '\t\t\t\t\t\t\t<p class="aligntext-right">New Ways</p>';
    markup += "\t\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t\t<div id="alignmentbar-duty" class="alignmentbar" style="display:none;">';
    markup += "\t\t\t\t\t\t\t<div class=\"alignmenticon-left\" onmouseover=\"return doTip('tip_alignment_family',function(){return renderAlignmentTip('family')});\" onmouseout=\"return noTip('tip_alignment_family');\"></div>";
    markup += "\t\t\t\t\t\t\t<div class=\"alignmenticon-right\" onmouseover=\"return doTip('tip_alignment_realm',function(){return renderAlignmentTip('realm')});\" onmouseout=\"return noTip('tip_alignment_realm');\"></div>";
    markup += '\t\t\t\t\t\t\t<div class="aligncenter"></div>';
    markup += '\t\t\t\t\t\t\t<div class="alignbar-left" style="width:45%"><span></span></div>';
    markup += '\t\t\t\t\t\t\t<div class="alignbar-right" style="width:15%"><span></span></div>';
    markup += '\t\t\t\t\t\t\t<p class="aligntext-left">Family</p>';
    markup += '\t\t\t\t\t\t\t<p class="aligntext-right">Realm</p>';
    markup += "\t\t\t\t\t\t</div>";
    markup += '\t\t\t\t\t\t<div id="alignmentbar-integrity" class="alignmentbar" style="display:none;">';
    markup += "\t\t\t\t\t\t\t<div class=\"alignmenticon-left\" onmouseover=\"return doTip('tip_alignment_cunning',function(){return renderAlignmentTip('cunning')});\" onmouseout=\"return noTip('tip_alignment_cunning');\"></div>";
    markup += "\t\t\t\t\t\t\t<div class=\"alignmenticon-right\" onmouseover=\"return doTip('tip_alignment_truthful',function(){return renderAlignmentTip('truthful')});\" onmouseout=\"return noTip('tip_alignment_truthful');\"></div>";
    markup += '\t\t\t\t\t\t\t<div class="aligncenter"></div>';
    markup += '\t\t\t\t\t\t\t<div class="alignbar-left" style="width:25%"><span></span></div>';
    markup += '\t\t\t\t\t\t\t<div class="alignbar-right" style="width:40%"><span></span></div>';
    markup += '\t\t\t\t\t\t\t<p class="aligntext-left">Cunning</p>';
    markup += '\t\t\t\t\t\t\t<p class="aligntext-right">Truthful</p>';
    markup += "\t\t\t\t\t\t</div>";
    markup += "\t\t\t\t\t</div>";
    markup += "\t\t\t\t</div>";
    markup += '\t\t\t\t<div id="alignment_tips">';
    for (x = 0; x < alignmentData.length; x++)
        markup +=
            '<div id="tip_alignment_' + alignmentData[x].symbol + '" style="top: -240px; left: -130px; position: relative"></div>';
    markup += "             </div>";
    markup += '\t\t\t\t<div class="chargenbox" id="activity">';
    markup += '\t\t\t\t\t<div class="marbletop">';
    markup += "\t\t\t\t\t\t<h3>Recent Activity</h3>";
    if (void 0 == playerData.recent_activity) markup += "         <p>No recent activity to display.</p>";
    else if (0 == playerData.recent_activity.length) markup += "         <p>No recent activity to display.</p>";
    else {
        for (a =
            0; a < playerData.recent_activity.length && 3 > a; a++) markup += '\t\t\t\t\t\t<p class="icon-' + playerData.recent_activity[a].type + '"><span style="width:27px;height:25px;"></span>' + playerData.recent_activity[a].text + "</p>";
        3 < playerData.recent_activity.length && (markup += '\t\t\t\t\t\t<span class="btnwrap btnmed" id="morebtn"><span class="btnedge"><a class="btnbrown" onclick="lineageMainModal(\'activities\');"><span></span>More</a></span></span>');
    }
    markup += "\t\t\t\t\t</div>";
    markup += "\t\t\t\t</div>";
    markup += '\t\t\t\t<div id="charbtmbar">';
    markup += '\t\t\t\t\t<div class="househr"></div>';
    markup += "\t\t\t\t</div>";
    $("#chargenmain").removeClass("stats");
    $("#chargenmain").html(markup);
    userContext.focusData.user_id != userContext.playerData.character.user_id && $(".frnd-" + userContext.focusData.friend_status).show();
    alignments = ["tradition", "integrity", "duty"];
    tips_markup = "";
    for (a = 0; a < alignments.length; a++)
        alignment = -1 * playerData["got_" + alignments[a]], 0 < alignment ? ($("#alignmentbar-" + alignments[a] + " > .alignbar-left").css("width", alignment / 100 /
            2 + "%").show(), $("#alignmentbar-" + alignments[a] + " > .aligntext-left").css("color", "white"), $("#alignmentbar-" + alignments[a] + " > .aligntext-right").css("color", "#666"), $("#alignmentbar-" + alignments[a] + " > .alignbar-right").hide()) : 0 > alignment ? ($("#alignmentbar-" + alignments[a] + " > .alignbar-right").css("width", alignment / -100 / 2 + "%").show(), $("#alignmentbar-" + alignments[a] + " > .aligntext-right").css("color", "white"), $("#alignmentbar-" + alignments[a] + " > .aligntext-left").css("color", "#666"), $("#alignmentbar-" +
            alignments[a] + " > .alignbar-left").hide()) : ($("#alignmentbar-" + alignments[a] + " > .aligntext-left").css("color", "white"), $("#alignmentbar-" + alignments[a] + " > .aligntext-right").css("color", "white"), $("#alignmentbar-" + alignments[a] + " > .alignbar-left").hide(), $("#alignmentbar-" + alignments[a] + " > .alignbar-right").hide());
    uiEvent("character");
    userContext.focusData.user_id == userContext.playerData.character.user_id && uiEvent("character_self");
};
log("Display additional info in the character tab.", "initialize");

inventoryDisplayStatsWithTab = function inventoryDisplayStatsWithTab(c, symbol) {
    // EXTENDER :: Modification, useless junk,
    // use this function as it appears to work better
    c = extractItemById(playerInventory, c);
    if (c && c.id == 0 && typeof symbol != "undefined") {
        statViewFromMini(symbol);
        return;
    }

    "unit" == c.slot
        ? inventorySubTab("companion")
        : inventorySubTab(c.slot);

    inventoryDisplayStats(void 0, void 0, c, void 0, !0);
};
log("Use alternative function for item popup if the initial fails.", "initialize");

inventoryTab = function inventoryTab(c) {
    $("#statview_container_right").html("");
    $("#statview_container").html("");
    $(".characterview").hide();
    $("." + c + "view").show();
    $("#swornswordstab_inner").removeClass("active");
    $("#foodtab_inner").removeClass("active");
    $("#charactertab_inner").removeClass("active");
    $("#boonstab_inner").removeClass("active");
    $("#resourcestab_inner").removeClass("active");
    $("#sealtab_inner").removeClass("active");
    $("#gearinvtab_inner").removeClass("active");
    $("#companionsinvtab_inner").removeClass("active");

    //EXTENDER :: Modification
    $("#permanentitemstab_inner").removeClass("active");

    $("#inventorybtm").removeClass("character");
    $("#weapontab").hide();
    $("#armortab").hide();
    $("#companiontab").hide();
    $("#swordcompaniontab").hide();
    $("#inventory-listing").hide();
    var a = [], b = void 0;

    // EXTENDER :: Clarification
    if ("character" == c) {
        $("#inventorybtm").addClass("character");
        $("#weapontab").show();
        $("#armortab").show();
        $("#companiontab").show();
        equipContextPrefix = equipContextTarget = "character";
        equipContextPosition = "right";
        $("#inventory_toolbar_Weapon").show();
    } else if ("swornswords" == c) {
        $("#inventorybtm").addClass("character");
        first_sworn = extractFirstSwornSword(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_sworn);
        $("#weapontab").show();
        $("#armortab").show();
        $("#swordcompaniontab").show();
        equipContextPrefix = "item";
        $("#inventory_toolbar").show();
        b = "Sworn Sword";
        a.push(b);
    } else if ("boons" == c) {
        first_boon = extractFirstBoon(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_boon);
        $("#inventory_toolbar").hide();
        b = "Boon";
        a.push(b);
    } else if ("food" == c) {
        first_consumable = extractFirstConsumable(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_consumable);
        $("#inventory_toolbar").hide();
        b = "Consumable";
        a.push(b);
    } else if ("seal" == c) {
        first_seal = extractFirstSeal(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_seal);
        $("#inventory_toolbar").hide();
        b = "Seal";
        a.push(b);
    } else if ("resources" == c) {
        first_resource = extractFirstTreasure(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_resource);
        $("#inventory_toolbar").hide();
        b = "Treasure";
        a.push(b);
    } else if ("gearinv" == c) {
        first_gearinv = extractFirstGear(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_gearinv);
        $("#inventory_toolbar").hide();
        b = "Weapon, Armor";
        a.push("Weapon");
        a.push("Armor");
    } else if ("companionsinv" == c) {
        first_companionsinv = extractFirstCompanion(playerInventory);
        inventoryDisplayStatsRight(void 0, void 0, first_companionsinv);
        $("#inventory_toolbar").hide();
        b = "Companion, Unit";
        a.push("Companion");
        a.push("Unit");
    } else if ("permanentitems" == c) {
        b = "pass please";
    }

    doLog("inventoryTab: category=" + c + " listing_slot=" + b);

    //console.debug("Logging pre display of storage: ", a);

    if (void 0 != b) {
        initPagination(c, 6);

        for (var d = !1, g = [], p = "", f = 0; f < playerInventory.length; f++) {
            // EXTEDNER :: Modification, clarification
            if (c === "permanentitems" && playerInventory[f].permanent_item) {
                g.push(playerInventory[f]);
                continue;
            }

            for (var m = 0; m < a.length; m++) {
                if (playerInventory[f].slot == a[m]) {
                    g.push(playerInventory[f]);
                }
            }
        }

        0 == g.length && (d = !0);

        //console.debug("Logging array to be displayed: ", g);

        p += "<div id='mv_container'></div>";

        "character" == c
            ? $("#inventory-listing").html(p).hide()
            : !0 == d ? "swornswords" == c
            ? $("#inventory-listing").html('You have no sworn swords. Visit the <a class="shop_link" href="#" onclick="return shopModal();">shop</a> to hire one.').show()
            : "food" == c
            ? $("#inventory-listing").html('You have no Food. Visit the <a class="shop_link" href="#" onclick="return shopModal();">shop</a> to purchase some.').show()
            : "boons" == c
            ? $("#inventory-listing").html('You have no Boons. Visit the <a class="shop_link" href="#" onclick="return shopModal();">shop</a> to purchase one.').show()
            : "seal" == c
            ? $("#inventory-listing").html("You have no Seals. Earn seals from PtP.").show()
            : "gearinv" == c
            ? $("#inventory-listing").html('You have no Gear. Visit the <a class="shop_link" href="#" onclick="return shopModal();">shop</a> to purchase some.').show()
            : "companionsinv" == c
            && $("#inventory-listing").html('You have no Companions. Visit the <a class="shop_link" href="#" onclick="return shopModal();">shop</a> to purchase some.').show()
            : $("#inventory-listing").html(p).show();

        d || (
            $.each(g, function(a, b) {
                addPageItem(c);
                itemMiniView(b, {
                    callback: inventoryDisplayStatsRight,
                    extra_styles: pageStyle(c),
                    extra_class: pageClass(c)
                }, "#mv_container");
            }),
            $("#mv_container").append(bookPageNumbers(c))
        );
    }

    $("#" + c + "tab_inner").addClass("active");
    void 0 != b && pageBegin(c);
};
log("Render permanent items.", "initialize");

inventoryModal = function inventoryModal(c, a) {
    closeUpgradePanel();
    uiTelemetry("inventory");
    void 0 == c ? (c = {}, c.storage = a, c.content_loading = !0, showSpinner(), $.ajaxq("gotAjaxQueue", { url: "/play/player_data?client_seqnum=" + userContext.player_data_seqnum, dataType: "JSON", success: function(b) { inventoryModal(b, a); } })) : (c.content_loading = !1, hideSpinner(), setupPlayerData(c, void 0), inventoryTab("character"));
    c.storage = a;
    c.allowseals = !0;
    var permanentsTab =
        '<span onclick="return clickInventoryTab(\'permanentitems\');" id="permanentitemstab" class="inventorytabwrap">' +
            '<span class="inventorytabedge">' +
            '<a id="permanentitemstab_inner" class="inventorytab">' +
            '<span></span>' +
            'Permanent' +
            '<em></em>' +
            '</a></span></span>';

    var b = _.template('<div id="modalwrap" class="modal690" style="display:block"><div class="contentframe1" id="content_character_view-inventory">\t<div class="contentframe2">\t\t<div class="contentframe3">\t\t\t<div class="contentframe4">\t\t\t<div class="stonecurve" id="stonecurve-l">\t\t\t\t<span></span>\t\t\t</div>\t\t\t<div class="stonecurve" id="stonecurve-r">\t\t\t\t<span></span>\t\t\t</div>\t\t\t<div class="infobar">\t\t\t\t<div class="infobarpattern"></div>\t\t\t<%\t\t\tif(data.storage)\t\t\t%>\t\t\t\t<h2><%= translateString(\'ui_storage\')  %></h2>\t\t\t<%\t\t\telse\t\t\t{\t\t\t%>\t\t\t\t<h2><%= translateString(\'your_character\') %></h2>\t\t\t<%\t\t\t}\t\t\t%>\t\t\t\t<span class="barbtmedge"></span>\t\t\t\t<span class="corner tl"></span>\t\t\t\t<span class="corner tr"></span>\t\t\t\t<a class="closebtn" onclick="return clickCloseInventory();">\t\t\t\t\t<%= translateString(\'close\')  %>\t\t\t\t</a>\t\t\t</div>\t\t\t<%\t\t\tif(!data.content_loading)\t\t\t{\t\t\t%>\t\t\t\t<div class="tabbedheading">\t\t\t\t\t<div class="inventorytabs">\t\t\t\t\t\t<%\t\t\t\t\t\tif(data.storage)\t\t\t\t\t\t{\t\t\t\t\t\t%>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="resourcetab"><span class="inventorytabedge""><a id="resourcestab_inner" class="inventorytab" onclick="clickInventoryTab(\'resources\');"><span></span><%= translateString(\'resource_tab_label\') %><em></em></a></span></span>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="boonstab" onclick="return clickInventoryTab(\'boons\');"><span class="inventorytabedge"><a class="inventorytab" id="boonstab_inner"><span></span><%= translateString(\'ui_ss_boons\')  %><em></em></a></span></span>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="foodtab" onclick="return clickInventoryTab(\'food\');"><span class="inventorytabedge"><a class="inventorytab" id="foodtab_inner"><span></span><%= translateString(\'ui_char_food\')  %><em></em></a></span></span>              <%              if(data.allowseals)              {              %>                <span class="inventorytabwrap" id="sealtab" onclick="return clickInventoryTab(\'seal\');"><span class="inventorytabedge"><a class="inventorytab" id="sealtab_inner"><span></span><%= translateString(\'ui_char_seal\')  %><em></em></a></span></span>                <span class="inventorytabwrap" id="gearinvtab" onclick="return clickInventoryTab(\'gearinv\');"><span class="inventorytabedge"><a class="inventorytab" id="gearinvtab_inner"><span></span><%= translateString(\'ui_char_gear\')  %><em></em></a></span></span>                <span class="inventorytabwrap" id="companionsinvtab" onclick="return clickInventoryTab(\'companionsinv\');"><span class="inventorytabedge"><a class="inventorytab" id="companionsinvtab_inner"><span></span><%= translateString(\'ui_char_companions\')  %><em></em></a></span></span>' + permanentsTab + '              <%              }              %>\t\t\t\t\t\t<%\t\t\t\t\t\t}\t\t\t\t\t\telse\t\t\t\t\t\t{\t\t\t\t\t\t%>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="armortab" style="right: 0px" onclick="return clickInventoryTab(\'character\');"><span class="inventorytabedge"><a class="inventorytab active" id="charactertab_inner"><span></span><%= translateString(\'equipment\')  %><em></em></a></span></span>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="charactertab" onclick="return characterModal(undefined, characterMainModal, true);"><span class="inventorytabedge"><a id="charactertab_inner" class="inventorytab"><span></span><%= translateString(\'mainmenu_character\')  %><em></em></a></span></span>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="pactstab"><span class="inventorytabedge"><a class="inventorytab"  id="pactstab_inner" onclick="return characterModal(undefined, pactsModal, true);"><span></span><%= translateString(\'pacts_and_influence\') %><em></em></a></span></span>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="statstab"><span class="inventorytabedge"><a class="inventorytab"  id="statstab_inner" onclick="return characterModal(undefined, statsModal, true);"><span></span><%= translateString(\'stats\') %><em></em></a></span></span>\t\t\t\t\t\t\t<span class="inventorytabwrap" id="achievementstab"><span class="inventorytabedge"><a class="inventorytab" id="achievementstab_inner" onmouseover="return setTooltip(\'achievementstab_inner\',\'achievements\');" onclick="return characterModal(undefined, achievementsModal, true);"><span></span><%= translateString(\'achievements\') %><em></em></a></span></span>\t\t\t\t\t\t<%\t\t\t\t\t\t}\t\t\t\t\t\t%>\t\t\t\t\t</div>\t\t\t\t</div>\t\t\t\t<div class="inventorycontent">\t\t\t\t\t<div id="statview_container_right"></div>\t\t\t\t\t\t<div class="darkroundedbox miniviewmenu-inventory" id="inventory-listing" style="display:none">\t\t\t\t\t\t</div>\t\t\t\t\t\t<div class="characterview">\t\t\t\t\t\t\t<div class="characterviewname"><h3><%= data.strings.title_and_name%></div>\t\t\t\t\t\t\t<div class="characterviewimg">\t\t\t\t\t\t\t\t<img src="<%= userContext.playerData.strings.portrait_pic %>" width="170">\t\t\t\t\t\t\t\t<span class="characterviewframe"></span>\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t<div class="characterviewstats">\t\t\t\t\t\t\t\t<span class="battlebonus"><span></span><var id="char_battlebonus" class="battle_val"><%= userContext.playerData.character.got_battle %></var></span>\t\t\t\t\t\t\t\t<span class="tradebonus"><span></span><var id="char_tradebonus" class="trade_val"><%= userContext.playerData.character.got_trade %></var></span>\t\t\t\t\t\t\t\t<span class="intriguebonus"><span></span><var id="char_intriguebonus" class="intrigue_val"><%= userContext.playerData.character.got_intrigue %></var></span>\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t<div class="characterviewinfo">\t\t\t\t\t\t\t\t<span id="chartalentbtn" class="btnwrap btnxxl" onclick="talentsModal();">\t\t\t\t\t\t\t\t\t<span class="btnedge">\t\t\t\t\t\t\t\t\t\t<a class="btngold">\t\t\t\t\t\t\t\t\t\t\t<span></span><%= translateString(\'talents\')  %>\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<%\t\t\t\t\t\t\t\t\t\t\tif(data.character.talents_earned>0)\t\t\t\t\t\t\t\t\t\t\t{\t\t\t\t\t\t\t\t\t\t\t%>\t\t\t\t\t\t\t\t\t\t\t\t<strong><%= data.character.talents_earned%><%= translateString(\'ui_char_point\')  %><%if(data.character.talents_earned > 1){%>s<%}%>\t\t\t\t\t\t\t\t\t\t\t\t</strong>\t\t\t\t\t\t\t\t\t\t\t<%\t\t\t\t\t\t\t\t\t\t\t}\t\t\t\t\t\t\t\t\t\t\t%>\t\t\t\t\t\t\t\t\t\t</a>\t\t\t\t\t\t\t\t\t</span>\t\t\t\t\t\t\t\t</span>\t\t\t\t\t\t\t\t<span id="charstoragebtn" class="btnwrap btnxxl" onclick="inventoryModal(undefined,true);">\t\t\t\t\t\t\t\t\t<span class="btnedge">\t\t\t\t\t\t\t\t\t\t<a class="btngold">\t\t\t\t\t\t\t\t\t\t\t<span></span><%= translateString(\'ui_storage\')  %>\t\t\t\t\t\t\t\t\t\t</a>\t\t\t\t\t\t\t\t\t</span>\t\t\t\t\t\t\t\t</span>\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t<div class="charseals">\t\t\t\t\t\t\t\t<%= characterSealMarkup() %>\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t<div class="characterequipmentinfo">\t\t\t\t\t\t\t\t<%= characterEquipmentMarkup() %>\t\t\t\t\t\t\t</div>\t\t\t\t\t\t\t<div class="characterviewbtm">\t\t\t\t\t\t\t\t<% if(hand_slot == null) %>\t\t\t\t\t\t\t\t\t<div id="character_weapon_container" onclick="return modalContextEquip(\'character\',\'Weapon\')"><div class="iconview iconview-weapon"></div></div>\t\t\t\t\t\t\t\t<% else %>\t\t\t\t\t\t\t\t\t<div id="character_weapon_container" onclick="return modalContextEquip(\'character\',\'Weapon\')"><%= itemIconView(hand_slot, "inventoryDisplayStatsWithTab", \'iconview-weapon\') %></div>\t\t\t\t\t\t\t\t<% if(armor_slot == null) %>\t\t\t\t\t\t\t\t\t<div id="character_armor_container" onclick="return modalContextEquip(\'character\',\'Armor\')"><div class="iconview iconview-armor"></div></div>\t\t\t\t\t\t\t\t<% else %>\t\t\t\t\t\t\t\t\t<div id="character_armor_container" onclick="return modalContextEquip(\'character\',\'Armor\')"><%= itemIconView(armor_slot, "inventoryDisplayStatsWithTab", \'iconview-armor\') %></div>\t\t\t\t\t\t\t\t<% if(companion_slot == null) %>\t\t\t\t\t\t\t\t\t<div id="character_companion_container" onclick="return modalContextEquip(\'character\',\'Companion\')"><div class="iconview iconview-companion"></div></div>\t\t\t\t\t\t\t\t<% else %>\t\t\t\t\t\t\t\t\t<div id="character_companion_container" onclick="return modalContextEquip(\'character\',\'Companion\')"><%= itemIconView(companion_slot, "inventoryDisplayStatsWithTab", \'iconview-companion\') %></div>\t\t\t\t\t\t\t</div>\t\t\t<% \t\t\t/* end of if(!data.content_loading) */\t\t\t}\t\t\t%>\t\t\t\t</div>\t\t\t</div>\t\t</div>\t<div class="contentbtm"></div></div></div>',
    { data: c });
    displayModalDialog(b, "character_dialog");
    !c.content_loading && a && ($("#inventorybtm").hide(), clickInventoryTab("resources"));
};
log("Add permanent items tab.", "initialize");

shopModal = function shopModal(b, a) {
    userContext.playerData.user.new_items = 0;
    updateAllStatus();
    doToolbar("shop");
    closeAlert();
    closeUpgradePanel();
    clearModalDialogs("modal_dialogs_top");
    doLog("shopModal");
    uiTelemetry("shop");

    // EXTENDER :: Modification, default tab: troopsequip
    void 0 == a && (a = "troopsequip");

    if (void 0 == b) {
        firstShopItem.swornswordstab = 0;
        firstShopItem.troopsequip = 0;
        firstShopItem.characterequip = 0;
        firstShopItem.boonstab = 0;
        firstShopItem.featuredtab = 0;
        firstShopItem.sealtab = 0;
        var c;
        c = "" + (shopModalHead() + shopModalFoot());
        isWeb() && displayModalDialog(c, void 0, void 0,
            "min-height: 692px; top: 0px; margin-top: 40px");
        showSpinner();
        $.ajaxQueue({
            url: "/play/shop/",
            dataType: "JSON",
            complete: hideSpinner,
            success: function(c) {
                shopModal(c, a);
            }
        });
    } else {
        hideSpinner();
        updateSilver(b.money);
        updateGold(b.perk_points);
        userContext.shopData = [];

        seals = [];
        for (c = 0; c < b.shop.length; c++)
            void 0 == b.shop[c].shop_expires_seconds && (doLog("shopModal: i=" + c + " item=" + b.shop[c].full_name), "Seal" == b.shop[c].slot ? seals.push(b.shop[c]) : userContext.shopData.push(b.shop[c]));

        seals.sort(function(a, c) {
            return c.rarity -
                a.rarity;
        });

        for (c = 0; c < seals.length; c++)
            userContext.shopData.push(seals[c]);

        for (c = 0; c < b.shop.length; c++)
            void 0 != b.shop[c].shop_expires_seconds &&
            (doLog("shopModal: i=" + c + " item=" + b.shop[c].full_name), userContext.shopData.push(b.shop[c]));

        baseShopTime = parseInt((new Date).getTime() / 1E3);
        c = "";
        initPagination("troopsequip", 6);
        initPagination("characterequip", 6);
        initPagination("boonstab", 6);
        initPagination("swornswordstab", 6);
        initPagination("sealtab", 6);
        userContext.totalItems.troopsequip = 0;
        userContext.totalItems.characterequip =
            0;
        userContext.totalItems.boonstab = 0;
        userContext.totalItems.swornswordstab = 0;
        b.cost_refresh_shop = 2;
        b.userContext = userContext;
        b.open_tab = a;
        b.featuredTabLabel && (phraseText.featured_tab_label = b.featuredTabLabel);
        b.dealsData ? (b.overrideDealsData = [], b.dealsData.map(function(a) { b.overrideDealsData.push(a); }), b.dealsData = [], b.overrideDealsData.map(function(a) {
                b.dealsData.push(a.symbol);
                a.price_perk_points && (itemFromSymbol(a.symbol).price_perk_points = a.price_perk_points);
            }), userContext.defaultDeals_id = itemFromSymbol(b.dealsData[0]).id,
            userContext.defaultDeals_symbol = b.dealsData[0]) : b.dealsData = shopSetDealData("deals");
        b.featuredItemPack ? (b.overridefeaturedItemPack = {}, b.overridefeaturedItemPack.symbol = b.featuredItemPack.symbol, b.overridefeaturedItemPack.price_perk_points = b.featuredItemPack.price_perk_points, b.featuredItemPack = b.overridefeaturedItemPack.symbol, b.overridefeaturedItemPack.price_perk_points && (itemFromSymbol(b.overridefeaturedItemPack.symbol).price_perk_points = b.overridefeaturedItemPack.price_perk_points), userContext.defaultFeaturedPack_id =
            itemFromSymbol(b.featuredItemPack).id, userContext.defaultFeaturedPack_symbol = b.featuredItemPack) : b.featuredItemPack = shopSetDealData("featured_item_pack");
        b.featuredItem ? (b.overridefeaturedItem = [], b.featuredItem.map(function(a) { b.overridefeaturedItem.push(a); }), b.featuredItem = [], b.overridefeaturedItem.map(function(a) {
            b.featuredItem.push(a.symbol);
            a.price_perk_points && (itemFromSymbol(a.symbol).price_perk_points = a.price_perk_points);
        })) : b.featuredItem = shopSetDealData("featured_items");
        for (c = 0; c < userContext.shopData.length; c++) {
            tabLocation =
                "";
            switch (userContext.shopData[c].slot) {
            case "Weapon":
            case "Armor":
                tabLocation = "troopsequip";
                break;
            case "Companion":
            case "Unit":
                tabLocation = "characterequip";
                break;
            case "Consumable":
            case "Boon":
            case "Food":
                tabLocation = "boonstab";
                break;
            case "Sworn Sword":
                tabLocation = "swornswordstab";
                break;
            case "Seal":
                tabLocation = "sealtab";
            }
            userContext.shopData[c].tabLocation = tabLocation;
            userContext.totalItems[tabLocation]++;
            doLog("shop: full_name=" + userContext.shopData[c].full_name + " slot=" + userContext.shopData[c].slot +
                " tabLocation=" + tabLocation);
            0 == firstShopItem[tabLocation] && (doLog("first " + tabLocation + ": " + userContext.shopData[c].id), firstShopItem[tabLocation] = userContext.shopData[c].id);
            "true" == userContext.shopData[c].featured && (firstShopItem.featuredtab = userContext.shopData[c].id);
        }

        // EXTENDER :: Modification
        userContext.shopData = sortShop(userContext.shopData);

        isWeb()
            ? (c = _.template('<%= shopModalHead() %><span class="btnwrap btnmed" id="sellbtn" onclick="return shopModalSell();"><span class="btnedge"><a class="btngold"><%= translateString(\'sell_an_item\') %></a></span></span></div><div id="store_bg_ss" class="storebg shopswords" style="display:none"></div><div id="store_bg_companion" class="storebg shopcompanions" style="display:none"></div>\t<% if(!isIpad()) { %> \t\t<div class="tabbedheading">\t\t\t<div class="inventorytabs">\t\t\t\t<span class="inventorytabwrap" id="dealstab"><span class="inventorytabedge"><a id="dealstab_inner" class="inventorytab" onclick="return shopTab(\'dealstab\');"><span></span><%= translateString(\'ui_shop_deals\')  %><em></em></a></span></span>\t\t\t\t<span class="inventorytabwrap" id="featuredtab"><span class="inventorytabedge"><a id="featuredtab_inner" class="inventorytab" onclick="return shopTab(\'featuredtab\');"><span></span><%= translateString(\'featured_tab_label\') %><em></em></a></span></span>\t\t\t\t<span class="inventorytabwrap" id="troopsequip"><span class="inventorytabedge"><a class="inventorytab" id="troopsequip_inner" onclick="return shopTab(\'troopsequip\');"><span></span><%= translateString(\'troopsequip_tab_label\') %><em></em></a></span></span>\t\t\t\t<span class="inventorytabwrap" id="characterequip"><span class="inventorytabedge"><a id="characterequip_inner" onclick="shopTab(\'characterequip\')"; class="inventorytab"><span></span><%= translateString(\'characterequip_tab_label\') %><em></em></a></span></span>\t\t\t\t<span class="inventorytabwrap" id="boonstab"><span class="inventorytabedge""><a id="boonstab_inner" class="inventorytab" onclick="shopTab(\'boonstab\');"><span></span><%= translateString(\'boons_tab_label\') %><em></em></a></span></span>\t\t\t\t<span class="inventorytabwrap" id="sealtab"><span class="inventorytabedge""><a id="sealtab_inner" class="inventorytab" onclick="shopTab(\'sealtab\');"><span></span><%= translateString(\'seals_tab_label\') %><em></em></a></span></span>\t\t\t</div>\t\t</div>\t<% } %>\t<div class="inventorycontent">\t\t<div class="deals packcontent" id="pack_container" style="display:none">\t\t</div>\t\t<div class="swornswordshopinfo" id="swornswordshopinfo">\t\t<% if(data.swornsword_next) { %>\t\t\t<span class="currentswords"><%= translateString(\'new_sworn_sword_in\') %>: <span id="inn_timer">\' + renderTime(json.swornsword_next) + \'</span></span>\t\t<% } else { %>\t\t\t<span class="currentswords"><span id="inn_timer"></span></span>\t\t<% } %>\t\t<span id="swornsword_remaining" class="swordlength"></span>\t</div>\t<div class="swornswordshopinfo" id="troopsequipshopinfo" style="display:none">\t<% if(data.gear_next) { %>\t\t<span class="currentswords"><%= translateString(\'new_gear_in\') %>: <span id="gear_timer"><%= renderTime(data.gear_next) %></span></span>\t<% } %>    <span id="shop_remaining" class="swordlength"></span>  </div>  <div class="swornswordshopinfo" id="characterequipshopinfo" style="display:none">\t<% if(data.companion_next) { %>\t\t<span class="currentswords"><%= translateString(\'new_companion_in\') %>: <span id="companion_timer"><%= renderTime(data.companion_next) %></span></span>\t<% } %>    <span id="shop_companion_remaining" class="swordlength"></span>  </div><div class="swornswordshopinfo" id="boonsshopinfo" style="display:none"></div><div id="statview_container_shop"></div><% if(data.open_tab==\'dealstab\') { %>\t<div id="shop_miniview" class="miniviewmenu-inventory" style="min-height: 410px; margin-left: -10px"><% } else { %>\t<div id="shop_miniview" class="darkroundedbox miniviewmenu-inventory" style="min-height: 410px;"><% } %><div class="swornswordbtns" id="swornswordbtns"><%\tif(data.userContext.playerData.character.level>=4) { %>\t<span class="btnwrap btnmed btnprice" id="refreshnowbtn"><span class="btnedge"><a class="btngold" onclick="return doShopRefresh(\'swornsword\');"><%= translateString(\'refresh_inn\') %></a></span><em><%= translateString(\'ui_shop_for\')  %></em><strong><%= data.cost_refresh_shop %></strong></span><% } %><div id="swornsword_message" style="display:none"><%= translateString(\'no_sworn_swords_now\') %></div></div><% if(data.userContext.playerData.character.level>=4) { %>\t<div class="swornswordbtns" id="troopsequipbtns" style="display:none">    <span class="btnwrap btnmed btnprice" id="refreshnowbtn"><span class="btnedge"><a class="btngold" onclick="return doShopRefresh(\'gear\');"><%= translateString(\'refresh_gear\') %></a></span><em><%= translateString(\'ui_shop_for\')  %></em><strong><%= data.cost_refresh_shop %></strong></span>\t</div><%\t} %><% if(data.userContext.playerData.character.level>=4) { %>\t<div class="swornswordbtns" id="characterequipbtns" style="display:none">    <span class="btnwrap btnmed btnprice" id="refreshnowbtn"><span class="btnedge"><a class="btngold" onclick="return doShopRefresh(\'companion\');"><%= translateString(\'refresh_companion\') %></a></span><em><%= translateString(\'ui_shop_for\')  %></em><strong><%= data.cost_refresh_shop %></strong></span>\t</div><%\t} %><%= shopDeals(data) %><%= shopFeatured(data) %>\x3c!-- Standard items --\x3e<% _.each(data.userContext.shopData,function(item,n){  %>\t<% var tabLocation = item.tabLocation; %>\t<% addPageItem(tabLocation); %>\t\t<div style="<%= pageStyle(tabLocation) %>" class="slot_<%= item.slot %> offersitem <%= pageClass(tabLocation) %>">\t<%= itemMiniView(item, {callback: shopDisplayStats, extra_styles: pageStyle(tabLocation), extra_class: pageClass(tabLocation)}) %>\t<%= markupOwnedPrice(userContext.shopData[n],\'doPurchase\',undefined,undefined) %>\t</div><% }); %><%= bookPageNumbers(\'troopsequip\',\'display:none\') %><%= bookPageNumbers(\'characterequip\',\'display:none\') %><%= bookPageNumbers(\'boonstab\',\'display:none\') %><%= bookPageNumbers(\'swornswordstab\',\'display:none\') %><%= bookPageNumbers(\'sealtab\',\'display:none\') %><span class="btnwrap btnsm" style="top:560px; left:0px; position: absolute" onclick="return enterOfferCode();"><span class="btnedge"><a class="btnbrown">Offer Code</a></span></span></span></div>',
            { data: b }), c += shopModalFoot(), displayModalDialog(c, void 0, void 0, "min-height: 692px; top: 0px; margin-top: 40px"))
            : iosSignal("shopData", "read", {
                shop: userContext.shopData,
                featuredItems: b.featuredItem.map(function(a) { return itemFromSymbol(a); }),
                featuredPack: itemFromSymbol(b.featuredItemPack),
                dealsData: b.dealsData.map(function(a) { return itemFromSymbol(a); })
            });

        killAllPanelTimers();
        isWeb() && shopTab(a);

        b.swornsword_next && (userContext.shopTimer.inn = setPanelTimeout("updateInnTimer(" + b.swornsword_next + ");", 1E3));
        b.gear_next && (userContext.shopTimer.gear = setPanelTimeout("updateGearTimer(" + b.gear_next + ");", 1E3));
        b.companion_next && (userContext.shopTimer.companion = setPanelTimeout("updateCompanionTimer(" + b.companion_next + ");", 1E3));
    }
};
log("Sort shop.", "initialize");

function hasGold(b, a, c) {
    // EXTENDER :: Modification, the short answer is no
    if (b > 0 && extender_neverSpendGold) {
        return false;
    }

    if (0 < b) {
        void 0 == c && (c = !1);
        doLog("hasGold: cost=" + b + " [player perk_points=" + userContext.playerData.user.perk_points + "]");
        if (b > userContext.playerData.user.perk_points) return currencyModal("gold"), iosSignal("purchase", "need_gold"), !1;
        if (2 == (userContext.playerData.user.options_mask & 2) && !1 == c)
            return dialogAlert({
                style: "confirm",
                button1: "Okay",
                button1_action: function() {
                    closeAlert();
                    a();
                },
                button2: "Cancel",
                heading: jsTranslate("Spend %{val} Gold", "val", numberWithDelimiter(b)),
                text: jsTranslate("Please confirm that you wish to spend %{val} gold.",
                    "val", numberWithDelimiter(b)),
                keep_previous: !0
            }), !1;
    }
    return !0;
}
log("Never spend gold option.", "initialize");

function pvpLaunch(callback) {
    json = { pvp: {} };
    json.pvp.target_id = pvpForm.target_id;
    json.pvp.sworn_sword_id = userContext.setSwornSword.id;
    json.pvp.pvp_action_symbol = userContext.currentActionLabel;
    json.pvp.region_symbol = fealtySymbol[pvpForm.target_faction_id];
    pvpForm.sub_region_index = Math.floor(3 * Math.random());
    var b = pvpForm.target_faction_id;
    void 0 == b && (b = userContext.playerData.character.faction_id);
    json.pvp.sub_region_symbol = fealtySubRegions[b][pvpForm.sub_region_index].symbol;
    json.pvp.attack_value = userContext.currentQuest.action_type[userContext.currentActionLabel].attacker_strength;
    json.pvp.defense_value = userContext.currentQuest.action_type[userContext.currentActionLabel].defender_strength;
    false || (showSpinner(),
    $.ajax({
        type: "get",
        url: "/pvps/create",
        data: json,
        dataType: "JSON",
        complete: hideSpinner,
        success: function(a) {
            void 0 == a.error ?
            (pvpForm = {},
            userContext.pvp = a,
            pvpRenderProgress(a),
            insertInventoryFromItem(playerInventory, a.attacker.sworn_sword),
            analytics.track("PvP Start", { pvp_context: "attack", pvp_action: json.pvp.pvp_action_symbol }),
            analytics.wizardtrack("PvP Start", {
                pvp_context: "attack",
                pvp_action: json.pvp.pvp_action_symbol
            }))
            : handleSwornSwordError(a.error);

            // EXTENDER :: Modification, call callback
            // parameter indicates successfull sending
            if (typeof callback == "function") {
                callback(!a.error);
            }
        }
    }));
}
log("Player vs player enhanced. Client pvpBan, hilarious.", "initialize");

var bossChallengeTimout;
function questSubmit(b, a, c, d, g, k, f) {
    doLog("questSubmit: stage=" + a + " choice=" + c);
    uiEvent("quest_submit_" + b + "_" + a + "_choice_" + c, userContext.playerData);
    userContext.postQuestEvent = "quest_post_" + b + "_" + a + "_choice_" + c;
    userContext.playerData;
    userContext.questActionChoice = c;
    b = void 0 != f ? "/play/quest?quest_id=" + f + "&stage=" + a + "&choice=" + c + "&chosen=" + escape(d) : "/play/quest?quest_symbol=" + b + "&stage=" + a + "&choice=" + c + "&chosen=" + escape(d);
    void 0 != g ? (b = isWeb() ? b + ("&chat=" + escape($("#" + g).val())) : b + ("&chat=" + escape(g)),
        userContext.hideWarParty = !0) : playSound("page-turn");
    void 0 != k && (userContext.dialogIndex++, userContext.dialogHistory[userContext.dialogIndex] = unescape(k));
    isIpad() && showSpinner();
    $.ajax({
        url: b,
        dataType: "JSON",
        success: function(a) {
            isIpad() && hideSpinner();
            questSubmitCallback(a);

            // EXTENDER :: Modification, auto boss challenger
            if (typeof a.actions_remaining == "undefined" || isNaN(a.actions_remaining)){				
				log("Not on boss challenge, or the boss challenge is completed", "BOSS");
				return;
			}
			
			if(!extender_autoBossChallenge){
				log("Boss challenge is not automated. Exiting...", "EXTENDER");
				return;
			}
				
			log("Boss challenge automated. Actions remaining: " + a.actions_remaining, "BOSS");

            if (a.actions_remaining > 0) {
                questSubmit(a.symbol, a.stage, c, a.chosen, null, null, a.id);
            } else {
                log("No actions remaining! Adjusting...", "BOSS");

                bossChallengeTimout =
                    setTimeout(function() {
                        questSubmit(a.symbol, a.stage, c, a.chosen, null, null, a.id);
                    }, 3 * 5 * 60 * 1000);

                log("Timer running. Fire again in 15 minutes.", "BOSS");

            }
        }
    });
	
    return !1;
}
log("Boss challenge code injected.", "initialize");


function doCampAttack(b, a, callback) {
    console.debug("Logging parameters, send camp attack: ", b, a, callback);
    if (!1 == checkParticipation() || !1 == allowCampAttack())
        return !1;

    if (void 0 != userContext.targetAllianceStance && void 0 == a) {
        var c = !1, d = userContext.currentActionLabel;

        if ("fight" == d || "hoodwink" == d || "steal" == d || "sabotage" == d || "hoodwink" == d || "harass" == d) c = !0;

        if (2 == userContext.targetAllianceStance.status && !0 == c)
            return doLog("show alert if you really want to attack your friendly alliance alert"), dialogAlert({
                style: "confirm",
                margin_top: 100,
                button1: "NO",
                button1_action: function() { return closeAlert(); },
                button2: "YES",
                button2_action: function() { doCampAttack(b, !0); },
                heading: "Action Confirmation",
                text: "Remember, this alliance is your friend! Are you certain you want to attack them?"
            }), !1;
    }

    $.ajax({
        url: "/play/camp_attack_begin?id=" + b + "&item_id=" + itemCurrentSelection.id + "&ability=" + userContext.currentActionLabel,
        dataType: "JSON",
        success: function(a) {

            if (a.error) {
                a.swornsword &&
                        insertInventoryFromItem(playerInventory, a.swornsword),
                    doAlert("Error Attacking Camp", a.error), !1;

            } else {
                campAttackProgress(a.camp_attack.id);
            }

            // EXTENDER :: Modification, call callback
            // parameter indicates successfull sending
            if (typeof callback == "function") {                
                callback(a);
            }
        }
    });
}
log("Camp attack now calls callback afterwards.", "initialize");