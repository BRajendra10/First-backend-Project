import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/autho.middleware.js';
import { getAllVideos, publishVideo, updateVideoDetails, updateVideoThumbnail } from '../controllers/video.controller.js';

const router = Router()

router.use(verifyJWT);
// to see or perform any task user must be verifyed

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishVideo
    )

router.route("/update_thumbnail").patch(upload.single("thumbnail"),updateVideoThumbnail)
router.route("/c/:videoId").patch(updateVideoDetails)

export default router