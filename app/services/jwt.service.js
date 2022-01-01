const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const accessTokenLifeSpan = 3600;
const refreshTokenLifeSpan = 3600*24*7;

const jwtService = {

  getTokens: (payload) => {
    
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: accessTokenLifeSpan
    });
    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: refreshTokenLifeSpan
    })
    
    return [accessToken, refreshToken];
  },
  getExpiredAccessToken: (payload) => {
    const expiredAccessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: 1
    });
    return expiredAccessToken;
  }
}
module.exports = {jwtService, accessTokenLifeSpan, refreshTokenLifeSpan}