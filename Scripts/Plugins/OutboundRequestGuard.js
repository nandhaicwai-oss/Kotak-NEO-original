(() => {
    const allowedHostnameSuffix = ".kotaksecurities.com";

    const isAllowedOutboundUrl = (value) => {
        try {
            const url = value instanceof URL ? value : new URL(String(value), window.location.href);
            return url.hostname === "kotaksecurities.com" || url.hostname.endsWith(allowedHostnameSuffix);
        } catch (_error) {
            return false;
        }
    };

    const blockOutbound = (kind, target) => {
        const targetUrl = typeof target === "string" ? target : String(target?.url || target);
        console.warn(`[NeoPlus] Blocked ${kind} outbound request to non-Kotak domain:`, targetUrl);
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
        const url = input instanceof Request ? input.url : input;
        if (!isAllowedOutboundUrl(url)) {
            blockOutbound("fetch", url);
            return Promise.reject(new Error("Blocked outbound fetch to non-Kotak domain"));
        }

        return originalFetch(input, init);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (!isAllowedOutboundUrl(url)) {
            blockOutbound("XMLHttpRequest", url);
            throw new Error("Blocked outbound XMLHttpRequest to non-Kotak domain");
        }

        return originalOpen.call(this, method, url, ...rest);
    };

    const NativeWebSocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
        if (!isAllowedOutboundUrl(url)) {
            blockOutbound("WebSocket", url);
            throw new Error("Blocked outbound WebSocket to non-Kotak domain");
        }

        return protocols === undefined
            ? new NativeWebSocket(url)
            : new NativeWebSocket(url, protocols);
    };
    window.WebSocket.prototype = NativeWebSocket.prototype;
    Object.defineProperty(window.WebSocket, "name", { value: "WebSocket" });
})();
