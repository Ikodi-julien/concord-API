const { Channel } = require("../models");
const { Sequelize } = require('sequelize');
const usersStatus = require('../services/usersStatus.service');

const channelController = {
    getChannelById: async (req, res) => {
        try {
            const onlineList = await usersStatus.getOnlineList(`channel-${req.params.id}`);

            const channel = await Channel.findByPk(req.params.id, {
                include: [{
                    association: 'users',
                    attributes: ['id', 'avatar', 'nickname', 'isLogged'],
                    through: {
                        attributes: []
                    }
                }, {
                    association: 'channel_messages',
                    include: 'user',
                }]
            });

            if (!channel) {
                return res.status(404).json({ message: 'Channel not found' });
            };

            for (const user of channel.users) {
                user.isLogged = onlineList.includes(user.id.toString()) ? true : false;
            }

            // Prepare data for frontend
            const formatedMessages = channel.channel_messages.map(message => ({
                id: message.id,
                content: message.content,
                nickname: message.user.nickname,
                avatar: message.user.avatar,
            }))
            
            return res.json({
                id: channel.id,
                title: channel.title,
                img_url: channel.img_url,
                rank: channel.rank,
                plot: channel.plot,
                year: channel.year,
                messages: formatedMessages,
                users: channel.users,
            });

        } catch (error) {
            console.log(error);
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    getAllChannels: async (_, res) => {
        try {
            const channels = await Channel.findAll({
                attributes: ["id", "title", "plot", "rank", "year", "img_url",[Sequelize.fn("COUNT", Sequelize.col('users')), "usersCount"]],
                group: ["Channel.id", "tags.id"],
                include: [
                    {
                        association: 'tags',
                        attributes: ['id', 'name'],
                        through: {
                            attributes: []
                        }
                    },
                    {
                        association: "users",
                        through: {
                            attributes: [],
                        },
                        attributes: []
                    }
                ],
                order : Sequelize.literal('"usersCount" DESC')
            });

            return res.json(channels);

        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    }
}

module.exports = channelController;
