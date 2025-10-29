import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/autho.middleware.js';
import { getAllVideos } from '../controllers/video.controller.js';

const router = Router()

router.use(verifyJWT);
// to see or perform any task user must be verifyed

router.route("/").get(getAllVideos)

export default router