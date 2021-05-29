// const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, Model) => {

    class Channel extends Model { };

    Channel.init({
        title: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Channel',
        tableName: 'channel'
    });

    return Channel;
};