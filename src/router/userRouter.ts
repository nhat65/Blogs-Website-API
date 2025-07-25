import express, { Router } from 'express';
import * as userController from '../controller/userController';
import { validatePassword, validateUser } from '../middleware/validate';
import { identifier } from '../middleware/identify';
import { saveImage } from '../middleware/saveImage';
import { updatePassword } from '../repository/accountRepository';
import { changePassword } from '../controller/accountController';

const router: Router = express.Router();

//Route handle create user
router.post('/create', identifier, saveImage(), validateUser, userController.createUser);

//Route handle get their user detail
router.get('/me', identifier, userController.getUserDetail);

//Route handle update user profile
router.post(
  '/update/:userId',
  identifier,
  saveImage(),
  validateUser,
  userController.updateUserProfile,
);

//Route handle change password
router.post('/changePassword', identifier, validatePassword, changePassword);

export default router;
