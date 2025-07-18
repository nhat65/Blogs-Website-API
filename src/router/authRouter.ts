import express, { Router } from 'express';
import * as authController from '../controller/authController';


const router: Router = express.Router();

router.post('/login', authController.Login);

export default router;
