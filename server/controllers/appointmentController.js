import { Appointment } from '../models/Appointment.js';

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAppointment = async (req, res) => {
    const appointment = req.body;
    const newAppointment = new Appointment(appointment);
    try {
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { doctorId, patientId, patientName, startTime, durationMinutes, status, type, notes, price } = req.body;

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
            doctorId, patientId, patientName, startTime, durationMinutes, status, type, notes, price
        }, { new: true });
        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ message: 'Appointment deleted successfully.' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const bulkCreateAppointments = async (req, res) => {
    const appointments = req.body;
    try {
        const created = await Appointment.insertMany(appointments);
        res.status(201).json(created);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const bulkUpdateAppointments = async (req, res) => {
    const updates = req.body; // Array of { id, data }
    try {
        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: update.data }
            }
        }));
        await Appointment.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Bulk update successful' });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};
