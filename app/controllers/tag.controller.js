const { Tag } = require('../models');
const { Sequelize } = require('sequelize');

const tagController = {
    getAllTags: async (_, res) => {
        try {
            const tags = await Tag.findAll();

            res.json(tags)

        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    },

    getAllTagsWithChannels: async (_, res) => {
        try {
            const tags = await Tag.findAll({
                group: ['Tag.id', 'channels.id'],
                include: {
                    association: 'channels',
                    attributes: ["id", "title", [Sequelize.fn("COUNT", Sequelize.col('channels->users')), "usersCount"]],
                    // group: ['Channel.id', 'Tag.id'],
                    through: {
                        attributes: []
                    },
                    include: {
                        association: "users",
                        through: {
                            attributes: [],
                        },
                        attributes: []
                    }
                }
            });

            res.json(tags)

        } catch (error) {
            const message = error.parent?.detail || error.message
            res.status(500).json({ message });
        }
    }
}

module.exports = tagController;