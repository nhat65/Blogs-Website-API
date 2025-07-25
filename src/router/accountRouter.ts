import express, { Router } from "express";
import * as accountController from "../controller/accountController";
import { identifier } from "../middleware/identify";
import { validateRegister } from "../middleware/validate";
import { authorize } from "../middleware/authorization";

const router: Router = express.Router();

//Route handle create account by admin
router.post("/create", identifier, authorize('admin'), validateRegister, accountController.createAccountByAdmin);

export default router;
