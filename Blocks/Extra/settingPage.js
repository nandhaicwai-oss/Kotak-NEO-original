window.onload = onWindowLoad;
let configPrefix = "KOTAK_";

function onWindowLoad() {

    const runtime = (typeof browser !== "undefined") ? browser.runtime : chrome.runtime;
    const manifest = runtime.getManifest();

    document.title = `${manifest.name} | Settings`;
    const extensionName = manifest.name.toLowerCase();
    console.log("Extension Name:", manifest.name);
    const logoElement = document.querySelector("#logo");
    const siteLinkElement = document.querySelector("#siteLink");
    const appNames = document.querySelectorAll(".appName");

    let logoPath;
    let appName;
    let siteText, siteAnchor;
    if (extensionName.includes("neo")) {
        logoPath = "Arts/NeoPlus_Logo.png";
        siteText = "Visit NeoPlus";
        siteAnchor = "https://radiuscraft.com/neoplus";
        appName = "NeoPlus"
        configPrefix = "KOTAK_";
    } else if (extensionName.includes("jainam")) {
        logoPath = "Arts/JainamPlus_Logo.png";
        siteText = "Visit JainamPlus";
        siteAnchor = "https://radiuscraft.com/jainamplus";
        appName = "JainamPlus";
        configPrefix = "JAINAM_";


    } else {
        logoPath = "Arts/Default_Logo.png";
        siteText = "kiteplus.radiuscraft.com";
        siteAnchor = "https://kiteplus.radiuscraft.com";
        appName = "KitePlus"
        configPrefix = "KITEPLUS_";
    }

    siteLinkElement.innerText = siteText;
    siteLinkElement.href = siteAnchor;
    logoElement.src = runtime.getURL(logoPath);
    appNames.forEach(element => {
        element.innerText = appName;
    });

    let toggleSwitch = document.querySelector("#toggle");
    let keyName = configPrefix + "kiteGlobalStatus";
    chrome.storage.local.get(keyName, function (result) {
        if (result[keyName] === undefined) {
            toggleSwitch.checked = true;
        } else {
            toggleSwitch.checked = result[keyName];
        }
    });
    toggleSwitch.addEventListener("change", async function () {
        console.log("setting status");
        let keyName = configPrefix + "kiteGlobalStatus";
        chrome.storage.local.set({
            [keyName]: toggleSwitch.checked,
        });
        chrome.tabs.reload();
    });


    let exportLogBtn = document.querySelector("#exportLogBtn");
    exportLogBtn.addEventListener("click", async function () {
        let logMessageDataKey = "logMessageDataKey";

        chrome.storage.local.get(logMessageDataKey, function (result) {
            if (result[logMessageDataKey] != undefined && result[logMessageDataKey] != null) {
                let csvContent = "data:text/csv;charset=utf-8,";
                let headerRow = "Time,Counter,Message";
                csvContent += headerRow + "\r\n";

                let messages = result[logMessageDataKey];

                for (let i = 0; i < messages.length; i++) {
                    csvContent += messages[i] + "\n";
                }
                let d = new Date();
                let displayString = "Logs_" + d.getFullYear() + "_" + (d.getMonth() + 1) + "_" + d.getDate() + "_" + d.getHours() + "_" + d.getMinutes();
                let encodedUri = encodeURI(csvContent);
                let CSVlink = document.createElement("a");
                CSVlink.setAttribute("href", encodedUri);
                CSVlink.setAttribute("download", displayString + ".csv");
                CSVlink.click();

            }
        });
    });

    async function loadToggleSet(params) {
        let settingToggleSet = [];
        settingToggleSet.push({
            title: "Basket Delta",
            keyName: "prefBasketDeltaKey",
            tooltip: "Display the option’s delta in the basket window, replacing the best-price value.",
            defaultValue: false,
        });
        settingToggleSet.push({
            title: "Premium Difference",
            keyName: "prefSyntheticPremDiffKey",
            tooltip: "Display premium difference between synthetic future and spot in Straddle-IV info section",
            defaultValue: false,
        });
        settingToggleSet.push({
            title: "No Tiled Window",
            keyName: "prefNoTiledWindowKey",
            tooltip: "Disable right side order window completly",
            defaultValue: false,
        });
        settingToggleSet.push({
            title: "Keep Order Window Open",
            keyName: "prefKeepOrderWindowKey",
            tooltip: "Order window stays open after orders execution.",
            defaultValue: false,
        });
        settingToggleSet.push({
            title: "Keep Basket Window Open",
            keyName: "prefKeepBasketWindowKey",
            tooltip: "Basket window stays open after orders execution.",
            defaultValue: false,
        });

        settingToggleSet.push({
            title: "All Indices chart",
            keyName: "prefAllIndicesKey",
            tooltip: "ATM chart for all the indices",
            defaultValue: false,
        });
        settingToggleSet.push({
            title: "STest",
            keyName: "prefsTestKey",
            tooltip: "Internal Test Setting",
            defaultValue: false,
        });
        settingToggleSet.push({
            title: "SDisable",
            keyName: "prefsSlDisableKey",
            tooltip: "Internal Test Setting",
            defaultValue: false,
        });

        settingToggleSet.push({
            title: "Log Messages",
            keyName: "prefLogMessageKey",
            tooltip: "Log important messages for dubug purposes.",
            defaultValue: false,
        });

        let toggleSetParent = document.querySelector(".toggleSetParent");
        let toggleHTML = `<div class="settingToggleParent" title="TOOLTIP_TEXT">
                    <div class="settingToggleLabel">HEADER_TEXT </div>
                    <div class="toggle-switch" style="scale: 0.8;">
                        <input class="toggle-input" id="INPUT_ID" type="checkbox">
                        <label class="toggle-label" for="INPUT_ID"></label>
                    </div>
                </div>`;
        let finalHTML = "";
        for (let i = 0; i < settingToggleSet.length; i++) {
            const settingToggleObject = settingToggleSet[i];
            let block = toggleHTML.replaceAll("INPUT_ID", "Toggle_" + i.toString());
            block = block.replace("HEADER_TEXT", settingToggleObject.title);
            block = block.replace("TOOLTIP_TEXT", settingToggleObject.tooltip);

            finalHTML += block;
        }
        toggleSetParent.innerHTML = finalHTML;

        for (let i = 0; i < settingToggleSet.length; i++) {
            const settingToggleObject = settingToggleSet[i];
            let toggle = document.querySelector("#" + "Toggle_" + i.toString());
            let loadedValue = await loadSettingValue(settingToggleObject.keyName, settingToggleObject.defaultValue);
            toggle.checked = loadedValue;
            toggle.addEventListener("change", async function () {
                // chrome.storage.local.set({
                //     [settingToggleObject.keyName]: toggle.checked,
                // });
                setSettingSyncStorage(settingToggleObject.keyName, toggle.checked);
            });
        }
    }
    loadToggleSet();


    async function loadInputSet(params) {
        let settingInputSet = [];
        settingInputSet.push({
            title: "Default Index F&O Lot Size",
            keyName: "prefDefaultIndexLotSizeKey",
            tooltip: "Default lot size for index options and futures in the order window",
            defaultValue: 1,
        });
        settingInputSet.push({
            title: "Default Stocks F&O Lot Size",
            keyName: "prefDefaultEquityLotSizeKey",
            tooltip: "Default lot size for stock options and futures in the order window",
            defaultValue: 1,
        });

        let inputSetParent = document.querySelector(".inputSetParent");
        let inputHTML = `<div class="settingInputParent" title="TOOLTIP_TEXT">
                    <div class="settingToggleLabel">HEADER_TEXT </div>
                    <input class="toggle-input" id="INPUT_ID" type="text">
                </div>`;
        let finalHTML = "";
        for (let i = 0; i < settingInputSet.length; i++) {
            const settingInputObject = settingInputSet[i];
            let block = inputHTML.replaceAll("INPUT_ID", "Input_" + i.toString());
            block = block.replace("HEADER_TEXT", settingInputObject.title);
            block = block.replace("TOOLTIP_TEXT", settingInputObject.tooltip);
            finalHTML += block;
        }
        inputSetParent.innerHTML = finalHTML;

        for (let i = 0; i < settingInputSet.length; i++) {
            const settingInputObject = settingInputSet[i];
            let inputElemet = document.querySelector("#" + "Input_" + i.toString());
            let loadedValue = await loadSettingValue(settingInputObject.keyName, settingInputObject.defaultValue);
            inputElemet.value = loadedValue;
            inputElemet.addEventListener("change", async function () {
                await setSettingSyncStorage(settingInputObject.keyName, inputElemet.value);
            });
            window.addEventListener("beforeunload", async function () {
                await setSettingSyncStorage(settingInputObject.keyName, inputElemet.value);
            });
        }
    }
    loadInputSet();
    // let noTiledWindow = document.querySelector("#noTiledWindowToggle");
    // let keyNoTiledWindow = "prefNoTiledWindowKey";
    // chrome.storage.local.get(keyNoTiledWindow, function (result) {
    //     if (result[keyNoTiledWindow] === undefined) {
    //         noTiledWindow.checked = false;
    //     } else {
    //         noTiledWindow.checked = result[keyNoTiledWindow];
    //     }
    // });
    // noTiledWindow.addEventListener("change", async function () {
    //     chrome.storage.local.set({
    //         prefNoTiledWindowKey: noTiledWindow.checked,
    //     });
    //     // chrome.tabs.reload();
    // });

    // let logMessageToggle = document.querySelector("#logMessageToggle");
    // let keyLogMessage = "prefLogMessageKey";
    // chrome.storage.local.get(keyLogMessage, function (result) {
    //     if (result[keyLogMessage] === undefined) {
    //         logMessageToggle.checked = false;
    //     } else {
    //         logMessageToggle.checked = result[keyLogMessage];
    //     }
    // });
    // logMessageToggle.addEventListener("change", async function () {
    //     chrome.storage.local.set({
    //         prefLogMessageKey: logMessageToggle.checked,
    //     });
    //     // chrome.tabs.reload();
    // });

    // let keepBasketWindowToggle = document.querySelector("#keepBasketWindowToggle");
    // let keyKeepBasketWindow = "prefKeepBasketWindowKey";
    // chrome.storage.local.get(keyKeepBasketWindow, function (result) {
    //     if (result[keyKeepBasketWindow] === undefined) {
    //         keepBasketWindowToggle.checked = false;
    //     } else {
    //         keepBasketWindowToggle.checked = result[keyKeepBasketWindow];
    //     }
    // });
    // keepBasketWindowToggle.addEventListener("change", async function () {
    //     chrome.storage.local.set({
    //         prefKeepBasketWindowKey: keepBasketWindowToggle.checked,
    //     });
    //     // chrome.tabs.reload();
    // });


    // let allIndicesToggle = document.querySelector("#allIndicesToggle");
    // let keyAllIndices = "prefAllIndicesKey";
    // chrome.storage.local.get(keyAllIndices, function (result) {
    //     if (result[keyAllIndices] === undefined) {
    //         allIndicesToggle.checked = false;
    //     } else {
    //         allIndicesToggle.checked = result[keyAllIndices];
    //     }
    // });
    // allIndicesToggle.addEventListener("change", async function () {
    //     chrome.storage.local.set({
    //         prefAllIndicesKey: allIndicesToggle.checked,
    //     });
    //     // chrome.tabs.reload();
    // });



    // let basketDeltaToggle = document.querySelector("#basketDeltaToggle");
    // let keyBasketDelta = "prefBasketDeltaKey";
    // chrome.storage.local.get(keyBasketDelta, function (result) {
    //     if (result[keyBasketDelta] === undefined) {
    //         basketDeltaToggle.checked = false;
    //     } else {
    //         basketDeltaToggle.checked = result[keyBasketDelta];
    //     }
    // });
    // basketDeltaToggle.addEventListener("change", async function () {
    //     chrome.storage.local.set({
    //         prefBasketDeltaKey: basketDeltaToggle.checked,
    //     });
    //     // chrome.tabs.reload();
    // });

}

async function setSettingSyncStorage(keyName, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            [configPrefix + keyName]: value,
        },
            () => resolve("success")
        );
    });
}
async function fetchSettingSyncStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([configPrefix + key], function (result) {
            if (result[configPrefix + key] === undefined) {
                resolve(null);
            } else {
                resolve(result[configPrefix + key]);
            }
        });
    });
}
async function loadSettingValue(keyName, defaultValue) {
    return new Promise(async (resolve, reject) => {
        let keyValue = await fetchSettingSyncStorage(keyName);
        if (keyValue == null) {
            setSettingSyncStorage(keyName, defaultValue);
            keyValue = defaultValue;
        }
        resolve(keyValue);
    });
}
async function ProcessRadioChange() {
    console.log("setting status");
    key = configPrefix + "kiteGlobalStatus";
    chrome.storage.local.set({
        [key]: true,
    });
}
