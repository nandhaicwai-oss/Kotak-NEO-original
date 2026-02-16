function isKotakUrl(input) {
    try {
        const url = new URL(input);
        return url.hostname === "kotaksecurities.com" || url.hostname.endsWith(".kotaksecurities.com");
    } catch {
        return false;
    }
}

function isMethodReadOnly(method) {
    const normalized = String(method || "GET").toUpperCase();
    return normalized === "GET" || normalized === "HEAD";
}

function canSendRequest(url, method, hasBody) {
    if (isKotakUrl(url)) {
        return true;
    }
    return isMethodReadOnly(method) && !hasBody;
}

async function stableFetch(url, options = {}) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    try {
        return await fetch(url, options);
    } catch {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return fetch(url, options);
    }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "API_FETCH") {
        (async () => {
            try {
                const method = message.method || "POST";
                const hasBody = message.body !== undefined && message.body !== null;

                if (!canSendRequest(message.url, method, hasBody)) {
                    sendResponse({ ok: false, error: "Blocked outbound write to non-Kotak domain" });
                    return;
                }

                const requestOptions = {
                    method,
                    headers: message.headers,
                };

                if (hasBody) {
                    requestOptions.body = typeof message.body === "string" ? message.body : JSON.stringify(message.body);
                }

                const response = await stableFetch(message.url, requestOptions);

                if (response.ok) {
                    const data = await response.json().catch(() => ({}));
                    sendResponse({ ok: true, status: response.status, data });
                } else {
                    const rawText = await response.text();
                    let parsedData;
                    let errorText;
                    try {
                        parsedData = JSON.parse(rawText);
                    } catch {
                        errorText = rawText;
                    }
                    sendResponse({ ok: false, status: response.status, error: errorText, data: parsedData });
                }
            } catch (error) {
                sendResponse({ ok: false, error: error.message });
            }
        })();
        return true;
    }

    if (message.type === "API_PLAIN_FETCH") {
        (async () => {
            try {
                const response = await stableFetch(message.url);
                const data = await response.text().catch(() => ({}));
                sendResponse({ ok: response.ok, status: response.status, data });
            } catch (error) {
                sendResponse({ ok: false, error: error.message });
            }
        })();
        return true;
    }

    return undefined;
});
