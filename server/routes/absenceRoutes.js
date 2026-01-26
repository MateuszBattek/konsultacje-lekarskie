import express from 'express';
import { getAbsences, createAbsence, updateAbsence, deleteAbsence } from '../controllers/absenceController.js';

const router = express.Router();

router.get('/', getAbsences);
router.post('/', createAbsence);
router.patch('/:id', updateAbsence);
router.delete('/:id', deleteAbsence);

export default router;
