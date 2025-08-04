import { Router } from 'express';
import { changePassword, getProfile, googleLogin, login, register, updateProfile} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
//post
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
//get
router.get('/profile', authenticateToken, getProfile);
//put
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
