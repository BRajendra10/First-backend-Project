import { Router } from 'express';

import { verifyJWT } from '../middlewares/autho.middleware.js';
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller.js';

const router = Router();

router.use(verifyJWT);
// Apply verifyJWT middleware to all routes in this file

router
    .route("/:videoId")
    .post(addComment)
    .get(getVideoComments)

router
    .route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router