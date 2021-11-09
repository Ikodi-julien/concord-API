const { Router } = require("express");
const router = Router();

const { authController, tagController } = require("../controllers");
const jwtMW = require('../middlewares/jwt.mw');
const privateRoutes = require('./private.route');


// [post] route for signup registration
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post('/logout', authController.logout);

// Keep in public route ?
router.get('/tags', tagController.getAllTags);

router.use(jwtMW.verify, privateRoutes);

module.exports = router;
