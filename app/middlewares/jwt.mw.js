const jwt = require('jsonwebtoken');
const {jwtService} = require('../services/jwt.service');
const cookieService = require('../services/cookie.service');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  verify: (req, res, next) => {
    const accessToken = req.cookies.access_token || "";
    const refreshToken = req.cookies.refresh_token || "";
    
    try {
      const accessTokenPayload = jwt.verify(accessToken, JWT_SECRET);
      console.log('payload dans jwt mid', accessTokenPayload);
      
      const [newAccessToken, newRefreshToken] = jwtService.getTokens({
        id: accessTokenPayload.id,
        firstname: accessTokenPayload.firstname,
        lastname: accessTokenPayload.lastname,
        nickname: accessTokenPayload.nickname,
        email: accessTokenPayload.email,
        password: '',
      });
          
      res.cookie('access_token', newAccessToken, cookieService.options);
      res.cookie('refresh_token', newRefreshToken, cookieService.options);
      
      req.user = accessTokenPayload;
      req.oldJwt = [accessToken, refreshToken];
      next();
      
    } catch (error) {

      if (error.name === 'TokenExpiredError') {

        try {
          const refreshTokenPayload = jwt.verify(refreshToken, JWT_SECRET);
          
          const [newAccessToken, newRefreshToken] = jwtService.getTokens({
            id: refreshTokenPayload.id,
            firstname: refreshTokenPayload.firstname,
            lastname: refreshTokenPayload.lastname,
            nickname: refreshTokenPayload.nickname,
            email: refreshTokenPayload.email,
            password: '',
          });
          
          res.cookie('access_token', newAccessToken, cookieService.options);
          res.cookie('refresh_token', newRefreshToken, cookieService.options);
          
          req.user = refreshTokenPayload;
          req.oldJwt = [accessToken, refreshToken];
          next();
        } catch (error) {
          
          res.status(401).json(error.name !== 'Error' ?
          error :
          {
              "message": "Vous avez été déconnecté automatiquement après une longue période d'inactivité"
          })
        }
      }
      res.status(401).json({message: error.message})
    }
  },
  verifyLogout: (req, res, next) => {
    const accessToken = req.cookies.access_token || "";
    // const refreshToken = req.cookies.refresh_token || "";
    // console.log(accessToken, refreshToken)
    
    try {
      const payload = jwt.verify(accessToken, JWT_SECRET);
      req.userId = payload.id;
      next();
      
    } catch (error) {

      if (error.name === 'TokenExpiredError') {
        next();
      }

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({message: error.message})
      }

      if (error.name === 'NotBeforeError') {
        res.status(401).json({message: error.message})
      }
    }
  }
}