import { Router } from 'express';
import { PrintTemplateController } from '../controllers/PrintTemplateController';
import { requireAuth } from '../middlewares/auth';
import { requirePermission } from '../middlewares/authorize';

const router = Router();
const printTemplateController = new PrintTemplateController();

router.get('/printable-fields', requireAuth, requirePermission('print_templates:read'), printTemplateController.getPrintableFields);
router.get('/', requireAuth, requirePermission('print_templates:read'), printTemplateController.getAll);
router.get('/:id', requireAuth, requirePermission('print_templates:read'), printTemplateController.getById);
router.post('/', requireAuth, requirePermission('print_templates:create'), printTemplateController.create);
router.put('/:id', requireAuth, requirePermission('print_templates:update'), printTemplateController.update);
router.delete('/:id', requireAuth, requirePermission('print_templates:delete'), printTemplateController.delete);

export default router;
