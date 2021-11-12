const { Router } = require("express");
const router = Router();

const { authController, tagController } = require("../controllers");
const jwtMW = require('../middlewares/jwt.mw');
const privateRoutes = require('./private.route');

router.get('/tags', tagController.getAllTags);

router.use(jwtMW.verify, privateRoutes);

module.exports = router;
