const asyncClient = require('../redisClient');

const PREFIX = 'teacup:'

const usersStatus = {
    addToOnlineList: async (channelKey, userId) => {
        await asyncClient.sadd(`${PREFIX + channelKey}-online`, userId);
    },

    removeFromOnlineList: async (channelKey, userId) => {
        await asyncClient.srem(`${PREFIX + channelKey}-online`, userId)
    },

    getOnlineList: async (channelKey) => {
        const users = await asyncClient.smembers(`${PREFIX + channelKey}-online`)

        return users
    },

    addSocketToList: async (channelKey, socket, userId) => {
        await asyncClient.zadd(`${PREFIX + channelKey}-sockets`, userId, socket);

        return await asyncClient.zcount(`${PREFIX + channelKey}-sockets`, userId, userId);
    },

    removeSocketFromList : async (channelKey, socket) => {
        await asyncClient.zrem(`${PREFIX + channelKey}-sockets`, socket)
    },

    checkSockets : async (channelKey, socket) => {
        const userId = await asyncClient.zscore(`${PREFIX + channelKey}-sockets`, socket)

        const sockets = await asyncClient.zrangebyscore(`${PREFIX + channelKey}-sockets`, userId, userId, "WITHSCORES");

        return sockets;
    }
}

module.exports = usersStatus;