import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { getUsersByRole, updateUserRole } from '../controllers/adminController';
import { bulkSetTeacherCoursesState } from '../controllers/courseController';

const router = Router();

router.get('/users',
    authenticateToken,
    authorizeRoles('admin', 'owner'),
    getUsersByRole
);

router.put('/users/:userId/role',
    authenticateToken,
    authorizeRoles('admin', 'owner'),
    updateUserRole
);

router.patch('/courses/teacher/:teacherId/bulk-state',
    authenticateToken,
    authorizeRoles('admin', 'owner'),
    bulkSetTeacherCoursesState
);

export default router;
