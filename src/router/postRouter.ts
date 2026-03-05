import express, { Router } from 'express';
import * as postController from '../controller/postController';
import { validateLogin, validatePost, validateRegister } from '../middleware/validate';
import { identifier } from '../middleware/identify';
import { saveImage } from '../middleware/saveImage';
import { authorize } from '../middleware/authorization';

const router: Router = express.Router();

//Route handle login
router.post('/create', identifier, saveImage(), validatePost, postController.createPost);

//Route handle user delete their post
router.delete('/:postId', identifier, postController.deleteOwnPost);

//Route handle get comments of post
router.get('/getComments/:postId', postController.getPostComments);

//Route handle get reaction of post
router.get('/getReaction/:postId/:userId', postController.getPostReaction);

//Route handle get all post
router.get('/', postController.getPostedPosts);

//Route handle update post
router.post('/update/:postId', identifier, saveImage(), validatePost, postController.updatePost);

//Router handle schedule post
router.post('/schedule', identifier, saveImage(), validatePost, postController.schedulePost);

//Route handle get post detail by slug
router.get('/detail/:postSlug', postController.getPostDetail);

//Route handle get user's posts by userId
router.get('/user/', identifier, postController.getUserPostsManagement);

//Route handle get all posts
router.get('/all', identifier, authorize('admin'), postController.getAllPostsManagement);

//Route handle get update post by id
router.get('/updateDetail/:postId', identifier, postController.getUpdatePost);

//Route handle get post by tag
router.get('/tag/:tagSlug', postController.getPostByTag);

//Route handle search post
router.get('/search/:content', postController.searchPost);

export default router;
