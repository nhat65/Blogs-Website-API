import express, { Router } from "express";
import * as userController from "../controller/userController";
import { validateUser } from "../middleware/validate";
import { identifier } from "../middleware/identify";
import { saveImage } from "../middleware/saveImage";

const router: Router = express.Router();

//Route handle create user
router.post("/createUser", identifier, saveImage(), validateUser, userController.createUser);

export default router;
