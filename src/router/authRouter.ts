import express, { Router } from 'express';
import * as authController from '../controller/authController';
import { validateLogin, validateRegister } from '../middleware/validate';
import { identifier } from '@/middleware/identify';

const router: Router = express.Router();

//Route handle login
router.post('/login',validateLogin ,authController.login);

 //Router handle register
 router.post('/register', validateRegister, authController.register);

//Router handle logout
router.post('/logout', identifier, authController.register);

export default router;
