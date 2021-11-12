module.exports = (sequelize, DataTypes, Model) => {

    class User extends Model { };

    User.init({
        authid: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false
        },
        nickname: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: false,
        },
        avatar: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: true,
        },

        recommendedChannels: DataTypes.VIRTUAL,

        isLogged: DataTypes.VIRTUAL
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'user',
        // defaultScope: {
        //     attributes: {
        //         exclude: ['password']
        //     }
        // },
        // scopes: {
        //     withPassword: {
        //         attributes: {
        //             include: ['password']
        //         }
        //     }
        // }
    });

    User.prototype.toJSON = function () {
        let values = Object.assign({}, this.get());

        // delete values.password;
        return values;
    }

    return User;
};