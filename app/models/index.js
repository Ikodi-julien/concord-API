const { Model, Sequelize } = require("sequelize");
const sequelize = require('../database')

const Channel = require('./channel.model')(sequelize, Sequelize, Model);
const Tag = require('./tag.model')(sequelize, Sequelize, Model);
const User = require('./user.model')(sequelize, Sequelize, Model);

// ---------------------

Channel.belongsToMany(User, {
    foreignKey: 'channel_id',
    otherKey: 'user_id',
    as: 'users',
    through: 'user_has_channel'
});

User.belongsToMany(Channel, {
    foreignKey: 'user_id',
    otherKey: 'channel_id',
    as: 'channels',
    through: 'user_has_channel'
});

// ---------------------

User.belongsToMany(Tag, {
    foreignKey: 'user_id',
    otherKey: 'tag_id',
    as: 'tags',
    through: 'user_has_tag'
});

Tag.belongsToMany(User, {
    foreignKey: 'tag_id',
    otherKey: 'user_id',
    as: 'users',
    through: 'user_has_tag'
});

// ---------------------

Tag.belongsToMany(Channel, {
    foreignKey: 'tag_id',
    otherKey: 'channel_id',
    as: 'channels',
    through: 'channel_has_tag'
});

Channel.belongsToMany(Tag, {
    foreignKey: 'channel_id',
    otherKey: 'tag_id',
    as: 'tags',
    through: 'channel_has_tag'
});

module.exports = {
    sequelize,
    Channel,
    Tag,
    User
};