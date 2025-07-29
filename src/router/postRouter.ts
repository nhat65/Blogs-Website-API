import express, { Router } from 'express';
import * as postController from '../controller/postController';
import { validateLogin, validatePost, validateRegister } from '../middleware/validate';
import { identifier } from '../middleware/identify';
import { saveImage } from '../middleware/saveImage';

const router: Router = express.Router();

//Route handle login
router.post('/createPost', identifier, saveImage(), validatePost, postController.createPost);

//Route handle user delete their post
router.delete('/:postId', identifier, postController.deleteOwnPost);

//Route handle get comments of post
router.get('/getComments/:postId', postController.getPostComments);

//Route handle get reaction of post
router.get('/getReaction/:postId', postController.getPostReaction);

//Route handle get all post
router.get('/', postController.getPostedPosts);

//Route handle update post
router.post('/update/:postId', identifier, saveImage(), validatePost, postController.updatePost);

//Router handle schedule post
router.post('/schedule', identifier, saveImage(), validatePost, postController.schedulePost);

//Route handle get post detail by slug
router.get('/detail/:postSlug', postController.getPostDetail);

export default router;
