import express, { Router } from "express";
import * as postController from "../controller/postController";
import {
  validateLogin,
  validatePost,
  validateRegister,
} from "../middleware/validate";
import { identifier } from "../middleware/identify";
import { saveImage } from "../middleware/saveImage";

const router: Router = express.Router();

//Route handle login
router.post('/createPost', identifier, saveImage(), validatePost , postController.createPost);

export default router;
