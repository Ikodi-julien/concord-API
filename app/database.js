require('dotenv').config()
const { Sequelize } = require('sequelize');

const options = process.env.NODE_ENV === 'production' ? {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
} :
    {
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }


const sequelize = new Sequelize(process.env.DATABASE_URL, options);

// -----------------------------------

(async _ => {
    try {
        await sequelize.authenticate();
        console.log('Connection to PgSQL Concord has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;