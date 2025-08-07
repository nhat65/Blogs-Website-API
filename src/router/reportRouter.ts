import express, { Router } from 'express';
import * as reportController from '../controller/reportController';
import { identifier } from '../middleware/identify';
import { authorize } from '../middleware/authorization';
import { validateReport } from '../middleware/validate';

const router: Router = express.Router();

// Route to create report
router.post(
  '/create',
  identifier,
  authorize('user', 'admin'),
  validateReport,
  reportController.createReport,
);

// Route to get all reposted
router.get('/', identifier, authorize('admin'), reportController.getReports);

// Route handle get reported of user
router.get('/user/', identifier, reportController.getUserReport);

// Route to dismiss report
router.post('/dismiss/:reportId', identifier, authorize('admin'), reportController.dismissReport);

// Route to resolve report
router.post('/resolve/:reportId', identifier, authorize('admin'), reportController.resolveReport);

export default router;
