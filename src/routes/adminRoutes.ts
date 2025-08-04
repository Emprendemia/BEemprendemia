import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { getUsersByRole, updateUserRole } from '../controllers/adminController';

const router = Router();

router.get('/users', authenticateToken, authorizeRoles('admin'), getUsersByRole);

router.put('/users/:userId/role', authenticateToken, authorizeRoles('admin'), updateUserRole);

export default router;
