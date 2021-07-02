// const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, Model) => {

    class Channel extends Model { };

    Channel.init({
        title: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false
        },
        img_url: {
            type: DataTypes.TEXT,
            unique: false,
            alloNull: true,
        },
        rank: {
            type: DataTypes.TEXT,
            unique: false,
            alloNull: true,
        },
        plot: {
            type: DataTypes.TEXT,
            unique: false,
            alloNull: true,
        },
        year: {
            type: DataTypes.INTEGER,
            unique: false,
            alloNull: true,
        }
    }, {
        sequelize,
        modelName: 'Channel',
        tableName: 'channel'
    });

    return Channel;
};