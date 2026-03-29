import { Router } from 'express';
import { signup, login, getMe, updateProfile } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/signup',          signup);
router.post('/login',           login);
router.get('/me',    protect,   getMe);
router.put('/profile', protect, updateProfile);

export default router;
