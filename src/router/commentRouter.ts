import express, { Router } from "express";
import * as commentController from "../controller/commentController";
import { identifier } from "../middleware/identify";
import { validateComment } from "../middleware/validate";

const router: Router = express.Router();

//Route handle create comment
router.post("/create", identifier, validateComment, commentController.createComment);

export default router;
