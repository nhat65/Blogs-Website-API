import express, { Router } from 'express';
import * as appealController from '../controller/appealController';
import { identifier } from '../middleware/identify';
import { authorize } from '../middleware/authorization';
import { validateAppeal } from '../middleware/validate';

const router: Router = express.Router();

//Route to handle user send appeal for post
router.post(
  '/post',
  identifier,
  authorize('admin', 'user'),
  validateAppeal,
  appealController.sendPostAppeal,
);

//Route to handle get user appeal
router.get('/me', identifier, authorize('admin', 'user'), appealController.getUserAppeal);

//Route to handle get all appeal
router.get('/', identifier, authorize('admin'), appealController.getAppeals);

//Route to handle reject appeal
router.post('/reject/:appealId', identifier, authorize('admin'), appealController.rejectAppeal);

//Route to handle resolve appeal
router.post('/resolve/:appealId', identifier, authorize('admin'), appealController.resolveAppeal);

export default router;
