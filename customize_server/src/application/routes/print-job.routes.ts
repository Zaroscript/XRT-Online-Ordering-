import { Router } from 'express';
import { Types } from 'mongoose';
import { PrintJobController } from '../controllers/PrintJobController';
import { PrintJobModel } from '../../infrastructure/database/models/PrintJobModel';

const router = Router();
const printJobController = new PrintJobController();

/**
 * Endpoints for the Local Print Agent
 */

// POST /api/print-jobs/claim
router.post('/claim', printJobController.claimJobs.bind(printJobController));

// PUT /api/print-jobs/:id/status
router.put('/:id/status', printJobController.updateStatus.bind(printJobController));

// PATCH /api/print-jobs/:id/ack
router.patch('/:id/ack', async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ ok: false, error: 'Invalid print job ID format' });
      return;
    }

    const job = await PrintJobModel.findByIdAndUpdate(
      id,
      { $set: { status: 'sent', sentAt: new Date(), lockedAt: null } },
      { new: true }
    ).lean();

    if (!job) {
      res.status(404).json({ ok: false, error: 'PrintJob not found' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to acknowledge print job' });
  }
});

/**
 * Endpoints for Admin Dashboard
 */

// GET /api/print-jobs/:id
router.get('/:id', printJobController.getJob.bind(printJobController));

export default router;
