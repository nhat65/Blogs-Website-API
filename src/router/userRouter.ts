import express, { Router } from 'express';
import * as userController from '../controller/userController';
import { validatePassword, validateUser } from '../middleware/validate';
import { identifier } from '../middleware/identify';
import { saveImage } from '../middleware/saveImage';
import { changePassword } from '../controller/accountController';
import { authorize } from '../middleware/authorization';

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

//Route handle get all user
router.get('/', identifier, authorize('admin'), userController.getUsers);

//Route handle delete user by admin
router.delete('/:userId', identifier, authorize('admin'), userController.deleteUser);

//Route handle lock user
router.post('/lock/:userId', identifier, authorize('admin'), userController.lockUser);

//Route handle unlock user
router.post('/unlock/:userId', identifier, authorize('admin'), userController.unlockUser);

export default router;
