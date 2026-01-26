import express from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notificationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.post('/', auth, createNotification);
router.patch('/:id/read', auth, markAsRead);

export default router;
