import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createCourse, getAllCourses, getCourseById, getCoursesByTeacherId, getMyCourses, updateCourse, updateCourseState } from '../controllers/courseController';


const router = Router();
//get
router.get('/', authenticateToken, getAllCourses);
router.get('/mine', authenticateToken, getMyCourses);
router.get('/:id', authenticateToken, getCourseById);
router.get('/teacher/:teacherId', authenticateToken, getCoursesByTeacherId);



//post
router.post('/', authenticateToken, createCourse);

//put
router.put('/:courseId', authenticateToken, updateCourse);

//patch
router.patch('/:courseId/state', authenticateToken, updateCourseState);


export default router;
