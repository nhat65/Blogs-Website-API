import express, { Router } from "express";
import * as userController from "../controller/userController";
import { validateUser } from "../middleware/validate";
import { identifier } from "../middleware/identify";
import { saveImage } from "../middleware/saveImage";

const router: Router = express.Router();

//Route handle create user
router.post("/create", identifier, saveImage(), validateUser, userController.createUser);

//Route handle get their user detail
router.get("/me", identifier, userController.getUserDetail)

export default router;
