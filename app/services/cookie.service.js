module.exports = {
  options: 
    process.env.NODE_ENV === 'production' ?
    {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      domain : "ikodi.eu"
    }
    :
    {
      httpOnly: true,
    }
}