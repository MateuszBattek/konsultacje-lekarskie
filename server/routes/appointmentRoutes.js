import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, bulkCreateAppointments, bulkUpdateAppointments } from '../controllers/appointmentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAppointments);
router.post('/', auth, createAppointment);
router.post('/bulk', auth, bulkCreateAppointments);
router.patch('/bulk', auth, bulkUpdateAppointments);
router.patch('/:id', auth, updateAppointment);
router.delete('/:id', auth, deleteAppointment);

export default router;
