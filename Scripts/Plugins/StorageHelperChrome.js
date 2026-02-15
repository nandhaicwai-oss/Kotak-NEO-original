// chrome.runtime.connect().addListener(function(port) {
//     // location.reload();
//     console.log("minside port");
// });

let currentBrowserName = "Chrome";
const targetRuntime = chrome.runtime;

function isAbv(value) {
    return value instanceof ArrayBuffer;
}
async function getLocalStorageItem(keyName) {
    return localStorage.getItem(keyName);
}

async function setSyncStorage(targetKey, value) {
    let keyName = configPrefix + targetKey;

    return new Promise((resolve, reject) => {
        chrome.storage.local.set(
            {
                [keyName]: value,
            },
            () => resolve("success")
        );
    });
}

function getStoreRatingLink(broker) {
    if (broker == KOTAK_BROKER) {
        return "https://chromewebstore.google.com/detail/neoplus-for-kotak/hnlkongpamangphfnllibgjefmjbbghm";
    }
    else {
        return "https://chromewebstore.google.com/detail/kiteplus-for-zerodha/jeomdaamgobhfeomjbbhgiileghbjidl";
    }
}


async function fetchSyncStorage(targetKey) {
    let key = configPrefix + targetKey;

    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            if (result[key] === undefined) {
                resolve(null);
            } else {
                resolve(result[key]);
            }
        });
    });
}
