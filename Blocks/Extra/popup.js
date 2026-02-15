window.onload = onWindowLoad;
let configPrefix = "KOTAK_";
function onWindowLoad() {
    let keyName = configPrefix + "kiteGlobalStatus";


    const runtime = (typeof browser !== "undefined") ? browser.runtime : chrome.runtime;
    const manifest = runtime.getManifest();

    document.title = `${manifest.name} | Settings`;
    const extensionName = manifest.name.toLowerCase();
    console.log("Extension Name:", manifest.name);
    const siteLinkElement = document.querySelector("#siteLink");
    const appNames = document.querySelectorAll(".appName");

    let appName;
    let siteText, siteAnchor;
    if (extensionName.includes("neo")) {
        siteText = "Visit NeoPlus";
        siteAnchor = "https://radiuscraft.com/neoplus";
        appName = "NeoPlus"
        configPrefix = "KOTAK_";
    } else if (extensionName.includes("jainam")) {
        siteText = "Visit JainamPlus";
        siteAnchor = "https://radiuscraft.com/jainamplus";
        appName = "JainamPlus";
        configPrefix = "JAINAM_";
    } else {
        siteText = "kiteplus.radiuscraft.com";
        siteAnchor = "https://kiteplus.radiuscraft.com";
        appName = "KitePlus"
        configPrefix = "KITEPLUS_";
    }

    siteLinkElement.innerText = siteText;
    siteLinkElement.href = siteAnchor;
    appNames.forEach(element => {
        element.innerText = appName;
    });


    chrome.storage.local.get(keyName, function (result) {
        if (result[keyName] === undefined) {
            toggleSwitch.checked = true;
        } else {
            toggleSwitch.checked = result[keyName];
        }
    });

    let toggleSwitch = document.querySelector("#toggle");
    toggleSwitch.addEventListener("change", async function () {
        console.log("setting status");
        let key = configPrefix + "kiteGlobalStatus";
        chrome.storage.local.set({
            [key]: toggleSwitch.checked,
        });
        chrome.tabs.reload();
    });

    let settingBtn = document.querySelector("#kitePlusSetting");
    settingBtn.addEventListener("click", async function () {
        (chrome || browser).runtime.openOptionsPage();
    });
}
async function ProcessRadioChange() {
    console.log("setting status");
    let key = configPrefix + "kiteGlobalStatus";
    chrome.storage.local.set({
        [key]: true,
    });
}
