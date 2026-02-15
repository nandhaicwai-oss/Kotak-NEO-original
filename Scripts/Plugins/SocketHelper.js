class WebSocketManager {
    constructor(url, options = {}) {
        this.url = url;
        this.socket = null;
        this.heartbeatInterval = null;
        this.lastMessageTime = null;
        this.isBinaryMode = options.isBinaryMode || false;
        this.reconnectDelay = options.reconnectDelay || 3000;
        this.heartbeatDelay = options.heartbeatDelay || 5000;
        this.connectionTimeout = options.connectionTimeout || 10000;
        this.onOpen = options.onOpen || (() => { });
        this.onConnect = options.onConnect || (() => { });
        this.onReconnect = options.onReconnect || (() => { });
        this.onMessage = options.onMessage || (() => { });
        this.onDisconnect = options.onDisconnect || (() => { });
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectDelay = options.maxReconnectDelay || 15000; // Max 30s delay
    }

    connect() {
        this.socket = new WebSocket(this.url);

        const connectTimer = setTimeout(() => {
            if (this.socket?.readyState === WebSocket.CONNECTING) {
                console.warn("WS connect timeout, forcing reconnect");
                this.socket.close();
            }
        }, this.connectionTimeout);


        this.socket.onopen = () => {
            clearTimeout(connectTimer);
            console.log("WebSocket connected");
            this.lastMessageTime = Date.now();
            this.reconnectAttempts = 0; // ✅ Reset after success
            this.onOpen(this.socket);
            this.onConnect();
            if (this.heartbeatDelay != -1)
                this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            this.lastMessageTime = Date.now();
            if (this.isBinaryMode)
                this.onMessage(event.data);
            else {
                const data = JSON.parse(event.data);
                this.onMessage(data);
            }
        };

        this.socket.onerror = (err) => {
            clearTimeout(connectTimer);
            console.error("WebSocket error:", err);
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close();
            }
        };

        this.socket.onclose = () => {
            clearTimeout(connectTimer);
            console.warn("WebSocket disconnected");
            this.onDisconnect();
            this.stopHeartbeat();
            this.reconnect();
        };
    }

    send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastMsg = now - (this.lastMessageTime || 0);
            // if (timeSinceLastMsg > this.connectionTimeout) {
            //     console.warn("No data received recently, reconnecting...");
            //     this.socket.close(); // Triggers reconnect
            //     return;
            // }

            this.send({ type: "hb" });
        }, this.heartbeatDelay);
    }

    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
    }
    reconnect() {
        if (this.isReconnecting) return;
        this.isReconnecting = true;

        this.reconnectAttempts++;

        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.warn(`Reconnecting in ${delay} ms (Attempt ${this.reconnectAttempts})`);
        this.onReconnect();

        setTimeout(() => {
            this.isReconnecting = false;
            this.connect();
        }, delay);
    }

    close() {
        this.stopHeartbeat();
        this.socket?.close();
    }
}