import express from 'express';
import { signin, signup, getDoctors } from '../controllers/userController.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.get('/doctors', getDoctors);

export default router;
