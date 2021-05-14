const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authService = require('../services/auth.service');

const verifyJWT = async (req, res, next) => {
    // const token = req.headers["x-access-token"];
    // console.log(req);
    // console.log(req.headers.cookie)

    const currentAccessToken = req.cookies.access_token || null;
    const currentRefreshToken = req.cookies.refresh_token || null;

    // console.log(req.headers.cookie)
    // console.log(req.headers.cookie.access_token)

    // const accessToken = req.headers.cookie?.access_token || null;
    // const refreshToken = req.headers.cookie?.refresh_token || null;

    if (!currentAccessToken && !currentRefreshToken) {
        console.log('pas de token')
        return res.status(401).send('No token found');
    }

    // const { err, decoded } = await jwt.verify(accessToken, jwtSecret);
    // if (!err) {
    //     req.userId = decoded.id;
    //     next();
    // }

    // if (err.name !== 'TokenExpiredError') {
    //     return res.status(401).send('Invalid Token');
    // }
    try {
        jwt.verify(currentAccessToken, jwtSecret, async (err, decoded) => {
            if (!err) { // Scenario ok
                console.log('ok with access token')
                req.userId = decoded.id;
                return next();
            };

            if (err && err.name !== 'TokenExpiredError') {
                console.log('token invalid')
                return next('Invalid token')
            };

            const decodedRefreshToken = jwt.verify(currentRefreshToken, jwtSecret);

            if (!decodedRefreshToken) {
                console.log('pas de decoded refresh token')
                return next('expired refresh token')
            }

            const redisToken = await authService.getRefreshToken(decodedRefreshToken.id) || null;

            if (!redisToken || JSON.parse(redisToken).refreshToken !== currentRefreshToken) {
                console.log('redis token invalid')
                console.log('redistoken :', redisToken)
                console.log('redisToken.refreshToken', JSON.parse(redisToken).refreshToken)
                console.log('refreshToken', currentRefreshToken)
                return next('Well nope ?') // probable hacker
                // throw new Error('Invalid redis token')
            };

            const {token, refreshToken} = await authService.generateTokens({ id: decodedRefreshToken.id });

            console.log('token', token)
            console.log('refresh', refreshToken)

            // ? "__refresh_token" in the tutorial error ?
            res.cookie("refresh_token", refreshToken, {
                httpOnly: true
            });

            // ? "__access_token" in the tutorial error ?
            res.cookie("access_token", token, {
                httpOnly: true
            });

            await authService.saveRefreshToken(decodedRefreshToken.id, refreshToken);

            req.userId = decodedRefreshToken.id;
            next();
        })
    }

    catch (err) {
        next(err)
    }
};

module.exports = verifyJWT;