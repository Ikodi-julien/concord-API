const { Router } = require("express");
const router = Router();
const {resolve} =require('path');

const { tagController } = require("../controllers");
const jwtMW = require('../middlewares/jwt.mw');
const privateRoutes = require('./private.route');

/*------------------------*/
// All app urls lead to landing page to avoid error 404 at refresh
router.get(['/', '/home', '/profile', '/discovery', '/error'], (req, res) => {
  res.sendFile(resolve(`./app/public/index.html`));
});

router.get('/tags', tagController.getAllTags);

router.use(jwtMW.verify, privateRoutes);

module.exports = router;
