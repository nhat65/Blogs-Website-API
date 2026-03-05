import express, { Router } from 'express';
import * as tagController from '../controller/tagController';
import { identifier } from '../middleware/identify';
import { authorize } from '../middleware/authorization';
import { validateTag } from '../middleware/validate';

const router: Router = express.Router();

// Route to get all tags
router.get('/', tagController.getTags);

// Route to create a new tag
router.post('/create', identifier, authorize('admin'), validateTag, tagController.createTag);

// Route to delete a tag
router.delete('/:tagId', identifier, authorize('admin'), tagController.deleteTag);

// Route to update a tag
router.post('/update/:tagId', identifier, authorize('admin'), validateTag, tagController.updateTag);

export default router;
