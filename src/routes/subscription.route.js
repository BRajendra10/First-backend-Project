import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/autho.middleware.js';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller.js';

const router = Router()

router.use(verifyJWT);

router.route("/c/:channelId").get(getUserChannelSubscribers);
router.route("/c/:channelId").post(toggleSubscription);
router.route("/u/:subscriberId").get(getSubscribedChannels);


export default router