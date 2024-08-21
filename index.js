const net = require('net');

module.exports = function PingMod(dispatch) {
    const serverIp = '51.210.49.231';
    const serverPort = 7801;
    let pingInterval = null; 
    let socket = null;

    dispatch.hook('S_LOAD_CLIENT_USER_SETTING', 'event', () => {
        createPrivateChannel();
        startPing();
    });

    function createPrivateChannel() {
        dispatch.toClient('S_JOIN_PRIVATE_CHANNEL', 2, {
            index: 6,
            channelId: -3,
            unk: [],
            name: 'Ping',
        });

        dispatch.hook('C_REQUEST_PRIVATE_CHANNEL_INFO', 2, event => {
            if (event.channelId === -3) {
                dispatch.toClient('S_REQUEST_PRIVATE_CHANNEL_INFO', 2, {
                    owner: true,
                    password: 0,
                    members: [],
                    friends: []
                });
                return false;
            }
        });
    }

    function startPing() {
        if (pingInterval) return;

        pingInterval = setInterval(pingServer, 1000);

        socket = new net.Socket();
        socket.setTimeout(2000);

        dispatch.hook('S_RETURN_TO_LOBBY', 'event', () => {
            if (pingInterval) clearInterval(pingInterval);
            if (socket) socket.destroy();
            pingInterval = null;
            socket = null;
        });
    }

    function pingServer() {
        const start = Date.now();

        socket.connect(serverPort, serverIp, () => {
            const ping = Date.now() - start;
            socket.destroy(); 
			
            dispatch.toClient('S_CHAT', 3, {
                channel: 17,
                message: ` ${ping} ms`
            });
			
            socket = new net.Socket();
        });
    }
};