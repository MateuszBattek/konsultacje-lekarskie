import { Absence } from '../models/Absence.js';

export const getAbsences = async (req, res) => {
    try {
        const absences = await Absence.find();
        res.status(200).json(absences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAbsence = async (req, res) => {
    const absence = req.body;
    const newAbsence = new Absence(absence);
    try {
        await newAbsence.save();
        res.status(201).json(newAbsence);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateAbsence = async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;

    try {
        const updatedAbsence = await Absence.findByIdAndUpdate(id, { startDate, endDate, reason }, { new: true });
        res.status(200).json(updatedAbsence);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const deleteAbsence = async (req, res) => {
    const { id } = req.params;
    try {
        await Absence.findByIdAndDelete(id);
        res.status(200).json({ message: 'Absence deleted successfully.' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
