const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const accessTokenLifeSpan = 5;
const refreshTokenLifeSpan = 15;

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