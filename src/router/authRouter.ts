import express, { Router } from 'express';
import * as authController from '../controller/authController';
import { validateLogin, validateRegister } from '../middleware/validate';
import { identify } from '../middleware/identify';


const router: Router = express.Router();

//Route handle login
router.post('/login',validateLogin ,authController.Login);

//Router handle register
router.post('/register', validateRegister, authController.Register);

//Router handle logout
router.post('/logout', identify, authController.Logout);

export default router;
