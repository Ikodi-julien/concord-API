const { Router } = require("express");
const router = Router();

const { authController, tagController } = require("../controllers");
const verifyJWT = require('../middlewares/auth.middleware');
const privateRoutes = require('./private.route');


// [post] route for signup registration
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post('/logout', authController.logout);
router.get('/auth/google', authController.googleConnect)

// Keep in public route ?
router.get('/tags', tagController.getAllTags);

router.use(verifyJWT, privateRoutes);

module.exports = router;
