import express, { Router } from 'express';
import * as reactionController from '../controller/reactionController';
import { identifier } from '../middleware/identify';
import { validateReaction } from '../middleware/validate';

const router: Router = express.Router();

//Route handle choose reaction
router.post('/choose', identifier, validateReaction, reactionController.handleReaction);

export default router;
