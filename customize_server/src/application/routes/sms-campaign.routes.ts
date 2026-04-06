import express from 'express';
import { SmsCampaignController } from '../controllers/SmsCampaignController';

const router = express.Router();
const smsCampaignController = new SmsCampaignController();

// List all campaigns (paginated)
router.get('/', smsCampaignController.paginated);

// Get a single campaign
router.get('/:id', smsCampaignController.getById);

// Create & send a new SMS campaign
router.post('/', smsCampaignController.create);

// Get live audience count before creating
router.post('/count', smsCampaignController.countAudience);

// Update an existing campaign and send
router.put('/:id', smsCampaignController.update);

// Resend an existing campaign
router.post('/:id/resend', smsCampaignController.resend);

// Delete a campaign
router.delete('/:id', smsCampaignController.delete);

export default router;
