import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, bulkCreateAppointments, bulkUpdateAppointments } from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', getAppointments);
router.post('/', createAppointment);
router.post('/bulk', bulkCreateAppointments);
router.patch('/bulk', bulkUpdateAppointments);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
