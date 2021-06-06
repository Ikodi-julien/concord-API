module.exports = (sequelize, DataTypes, Model) => {

    class Message extends Model { };
    
    Message.init({
        content: {
            type: DataTypes.JSON,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Message',
        tableName: 'message'
    });

    return Message;
};