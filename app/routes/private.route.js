const { Router } = require("express");
const router = Router();

const { channelController, tagController, userController } = require("../controllers");

router.post('/me', userController.newProfile)
router.get('/me', userController.profile)
// [put] route for update user
router.put('/me', userController.updateMe);
router.put('/me/tags', userController.updateMeTags);
// [patch] route for update user
router.patch('/me', userController.updatePassword);
router.put('/me/avatar', userController.updateAvatar);
// [delete] route for delete user
router.delete('/me', userController.delete);
router.get('/me/channels', userController.getUserChannels);
router.delete('/me/channels/:id(\\d+)', userController.removeJoinedChannel);
router.get('/me/recommended', userController.getRecommendedChannels);

router.get('/channels', channelController.getAllChannels);
router.get('/channel/:id(\\d+)', channelController.getChannelById);

router.get('/tags/channels', tagController.getAllTagsWithChannels);

module.exports = router;