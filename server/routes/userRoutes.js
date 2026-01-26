import express from 'express';
import { signin, signup, getDoctors, refreshToken, logout } from '../controllers/userController.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.get('/doctors', getDoctors);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
