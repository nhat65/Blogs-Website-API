import express, { Router } from 'express';
import * as commentController from '../controller/commentController';
import { identifier } from '../middleware/identify';
import { validateComment } from '../middleware/validate';

const router: Router = express.Router();

//Route handle create comment
router.post('/create', identifier, validateComment, commentController.createComment);

//Route handle update comment
router.post('/update/:commentId', identifier, validateComment, commentController.updateComment);

//Route handle get comment count
router.get('/count/:postId', commentController.getCommentCount);

//Route handle get replys by comment id
router.get('/replies/:commentId', commentController.getReplyComments);

//Route handle delete user comment
router.delete('/:commentId', identifier, commentController.deleteOwnComment);

//Route handle get user's comments
router.get('/me', identifier, commentController.getOwnComment);

export default router;
