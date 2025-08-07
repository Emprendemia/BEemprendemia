import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getRecentCourses, removeRecentCourse, updateRecentCourse } from '../controllers/userController';

const router = Router()



router.patch('/recent-course', authenticateToken, updateRecentCourse);
router.get('/recent-courses', authenticateToken, getRecentCourses);
router.delete('/recent-course/:courseId', authenticateToken, removeRecentCourse);

export default router