import { Router } from 'express';
import { ImportController } from '../controllers/ImportController';
import { requireAuth } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/authorize';
import { writeRateLimitMiddleware } from '../middlewares';
import { upload } from '../middlewares/upload';
import { UserRole } from '../../shared/constants/roles';

const router = Router();
const importController = new ImportController();

// All routes require auth; Super Admin is enforced in ImportController (parse/append included).
router.use(requireAuth);
router.use(authorizeRoles(UserRole.SUPER_ADMIN));

// Parse and validate import file
router.post(
  '/parse',
  writeRateLimitMiddleware,
  upload.single('file'), // Accept CSV or ZIP
  importController.parseAndValidate
);

// Get import session
router.get('/sessions/:id', importController.getSession);

// List import sessions
router.get('/sessions', importController.listSessions);

// Update import session (save draft)
router.put('/sessions/:id', importController.updateSession);

// Append file to session
router.post(
  '/sessions/:id/append',
  writeRateLimitMiddleware,
  upload.single('file'),
  importController.appendFile
);

// Final save to database
router.post('/sessions/:id/save', writeRateLimitMiddleware, importController.finalSave);

// Discard import session
router.post('/sessions/:id/discard', importController.discardSession);

// Delete import session
router.delete('/sessions/:id', importController.deleteSession);

// Download errors as CSV
router.get('/sessions/:id/errors', importController.downloadErrors);

// Rollback import session
router.post('/sessions/:id/rollback', writeRateLimitMiddleware, importController.rollbackSession);

// Clear import history
router.delete('/sessions', importController.clearHistory);

export default router;
