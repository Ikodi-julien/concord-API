const jwt = require('jsonwebtoken');

const authService = require('../services/auth.service');

const JWT_SECRET = require('../services/JWT_SECRET');

const verifyJWT = async (req, res, next) => {

    const accessToken = req.cookies.access_token || null;
    const refreshToken = req.cookies.refresh_token || null;

    try {
        if (!accessToken && !refreshToken) {
            throw new Error('No token found');
        }

        await jwt.verify(accessToken, JWT_SECRET, async (err, decodedAccessToken) => {
            if (!err && decodedAccessToken) {
                req.userId = decodedAccessToken.id
                return next()
            };

            if (err.name !== 'TokenExpiredError') {
                throw err;
            };


            const decoded = jwt.verify(refreshToken, JWT_SECRET)

            const { refreshToken: redisToken } = await authService.getRefreshToken(decoded.id, accessToken);

            if (redisToken !== refreshToken) {
                throw new Error("refresh token is invalid or expired");
            };

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.generateTokens({ id: decoded.id }, accessToken);

                res.cookie("access_token", newAccessToken, authService.cookieOptions);

                res.cookie("refresh_token", newRefreshToken, authService.cookieOptions);

            req.userId = decoded.id;
            next();
        })
    }

    catch (error) {
        console.log(error)
        res.status(401).json(error.name !== 'Error' ?
            error :
            {
                "message": error.message
            })
    }

};

module.exports = verifyJWT;