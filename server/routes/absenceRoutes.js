import express from 'express';
import { getAbsences, createAbsence, updateAbsence, deleteAbsence } from '../controllers/absenceController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAbsences);
router.post('/', auth, createAbsence);
router.patch('/:id', auth, updateAbsence);
router.delete('/:id', auth, deleteAbsence);

export default router;
