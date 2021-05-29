const { Channel, User } = require('../models');
const usersStatus = require('./usersStatus.service');

const socketHandler = {
    auth: (socket, io) => {
        socket.on('auth', async ({ channel, user }) => {
            /*
            {
                user : {
                    id : number,
                    nickname : string
                },
                channel : {
                    id : number
                },
                onlineUsers : [
                    {
                    id : number,
                    nickname : string
                },
                {
                    id : number,
                    nickname : string
                },
                etc
                ]
            }
            */
            const channelKey = `channel-${channel.id}`;

            try {
                socket.join(channelKey);

                const currentChannel = await Channel.findByPk(channel.id);
                await currentChannel.addUser(user.id);

                await usersStatus.addToOnlineList(channelKey, user.id);

                const socketsCount = await usersStatus.addSocketToList(channelKey, socket.id, user.id)

                // send confirmation to front that user had join the channel
                socket.emit('confirm');

                // If user did not already had an active socket for this room, we can tell front to add him to online user list
                if (socketsCount === 1) {
                    // key 'user-join' to tell front to add user to online user list
                    io.to(channelKey).emit('user:join', { channel, user });
                }

            } catch (err) {
                socket.emit('error', err);
                console.error(err)
            }
        })
    },

    message: (socket, io) => {
        socket.on('message', message => {
            /*
            {
                id : string (messageId) (have to be send)
                user : {
                    id : number,
                    nickname : string
                }
                channel : {
                    id : number
                },
                content : string
            }
            */
            message.id = `${message.user.id}-${Date.now()}`

            io.to(`channel-${message.channel.id}`).emit('message', message);
        })
    },

    disconnecting: (socket, io) => {
        socket.on('disconnecting', async () => {
            try {
                const channelKey = [...socket.rooms][1] || null;

                if (!channelKey) {
                    return;
                }

                const socketsList = await usersStatus.checkSockets(channelKey, socket.id);
                const userId = socketsList[1]

                // if this socket was the last one of the user for this room, we can tell front to shift user from online list to offline
                if (socketsList.length <= 2) {
                    await usersStatus.removeFromOnlineList(channelKey, userId);

                    // key 'user-leave' to tell front to shift user from online user list to offline user list
                    io.to(channelKey).emit('user:leave', {
                        channel: {
                            id: parseInt(channelKey.slice(8))
                        },
                        user: {
                            id: parseInt(userId)
                        }
                    });

                }

                await usersStatus.removeSocketFromList(channelKey, socket.id)

            } catch (err) {
                socket.emit('error', err);
                console.error(err)
            }

        })
    }
};

module.exports = socketHandler;