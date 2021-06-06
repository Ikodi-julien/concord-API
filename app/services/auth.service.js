const jwt = require('jsonwebtoken');

const asyncClient = require('../redisClient');


const PREFIX = "teacup:";
// use the command underneath to generate a jwt secret key and then, store it your own .env
// node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
const JWT_SECRET = require('./JWT_SECRET');

const jwtExpiration = 300;
const jwtRefreshExpiration = 60 * 60 * 24 * 30;
const refreshTokenMaxAge = new Date() + jwtRefreshExpiration;

const auth = {
    cookieOptions: process.env.NODE_ENV === 'production' ?
        {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            domain : 'chat-api-ikodi.herokuapp.com'
        } :
        {
            httpOnly: true,
        },

    generateTokens: async (payload, previousAccessToken) => {
        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: jwtExpiration
        });
        const refreshToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: jwtRefreshExpiration
        });

        await auth.saveRefreshToken(payload.id, accessToken, refreshToken, previousAccessToken);

        return { accessToken, refreshToken }
    },

    saveRefreshToken: async (userId, accessToken, refreshToken, previousAccessToken) => {
        if (previousAccessToken) {
            await asyncClient.del(`${PREFIX}refreshToken-user${userId}-${previousAccessToken}`);
        };

        await asyncClient.setex(`${PREFIX}refreshToken-user${userId}-${accessToken}`,
            jwtRefreshExpiration,
            JSON.stringify({
                refreshToken,
                expires: refreshTokenMaxAge
            }))
    },

    getRefreshToken: async (userId, accessToken) => {
        const refreshToken = await asyncClient.get(`${PREFIX}refreshToken-user${userId}-${accessToken}`);

        if (!refreshToken) {
            throw new Error("refresh token is invalid or expired")
        };

        return JSON.parse(refreshToken)
    },

    deleteRefreshToken: async (userId, accessToken) => {
        await asyncClient.del(`${PREFIX}refreshToken-user${userId}-${accessToken}`);
    },

    deleteAllRefreshToken: async (userId) => {
        let cursor;
        const pattern = `${PREFIX}refreshToken-user${userId}-*`

        do {
            [cursor, keys] = await asyncClient.scan(cursor || 0, 'MATCH', pattern);
            await Promise.all(keys.map((key) => asyncClient.del(key)));
        } while (cursor !== '0');
    }
};

module.exports = auth;