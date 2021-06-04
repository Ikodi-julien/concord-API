module.exports = (sequelize, DataTypes, Model) => {

    class User extends Model { };

    User.init({
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nickname: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        email: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: {
                    args: true,
                    msg: `The mail address is invalid or already in use`
                }
            }
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        recommendedChannels: DataTypes.VIRTUAL,

        isLogged: DataTypes.VIRTUAL
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'user',
        defaultScope: {
            attributes: {
                exclude: ['password']
            }
        },
        scopes: {
            withPassword: {
                attributes: {
                    include: ['password']
                }
            }
        }
    });

    User.prototype.toJSON = function () {
        let values = Object.assign({}, this.get());

        delete values.password;
        return values;
    }

    return User;
};