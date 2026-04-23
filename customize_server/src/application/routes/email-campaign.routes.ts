import express from 'express';
import { EmailCampaignController } from '../controllers/EmailCampaignController';

const router = express.Router();
const emailCampaignController = new EmailCampaignController();

// List all campaigns (paginated)
router.get('/', emailCampaignController.paginated);

// Dashboard analytics summary
router.get('/analytics', emailCampaignController.getAnalytics);

// Get single campaign
router.get('/:id', emailCampaignController.getById);

// Create & send a new email campaign
router.post('/', emailCampaignController.create);

// Get live audience count before creating
router.post('/count', emailCampaignController.countAudience);

// Update an existing campaign and send
router.put('/:id', emailCampaignController.update);

// Get a single campaign
router.post('/:id/resend', emailCampaignController.resend);

// Delete a campaign
router.delete('/:id', emailCampaignController.delete);

export default router;
