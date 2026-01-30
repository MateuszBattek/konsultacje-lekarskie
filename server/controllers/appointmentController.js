import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';

export const getAppointments = async (req, res) => {
    try {
        const { doctorId } = req.query;
        const filter = doctorId ? { doctorId } : {};
        const appointments = await Appointment.find(filter);
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
        const appointment = await Appointment.findById(id);

        const isCancellation =
            (appointment && appointment.status === 'BOOKED' && status === 'CANCELLED') ||
            (appointment && appointment.status === 'BOOKED' && status === 'AVAILABLE' && (patientId === null || patientId === undefined));

        if (isCancellation && !appointment.isSubSlot) {
            const date = new Date(appointment.startTime).toLocaleDateString('pl-PL');
            const time = new Date(appointment.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            await Notification.create({
                recipientId: appointment.patientId,
                message: `Twoja wizyta z dnia ${date} o godzinie ${time} została odwołana przez lekarza.`,
                type: 'CANCELLATION'
            });
        }

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
        const appointment = await Appointment.findById(id);

        if (appointment.status === 'BOOKED' && appointment.patientId && !appointment.isSubSlot) {
            const date = new Date(appointment.startTime).toLocaleDateString('pl-PL');
            const time = new Date(appointment.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            await Notification.create({
                recipientId: appointment.patientId,
                message: `Twoja wizyta z dnia ${date} o godzinie ${time} została usunięta z grafiku przez lekarza.`,
                type: 'CANCELLATION'
            });
        }

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
        const cancelledUpdates = updates.filter(u => u.data.status === 'CANCELLED');

        if (cancelledUpdates.length > 0) {
            const ids = cancelledUpdates.map(u => u.id);
            const appointmentsToNotify = await Appointment.find({
                _id: { $in: ids },
                status: 'BOOKED',
                isSubSlot: { $ne: true }
            });

            const notifications = appointmentsToNotify.map(apt => {
                const date = new Date(apt.startTime).toLocaleDateString('pl-PL');
                const time = new Date(apt.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

                return {
                    recipientId: apt.patientId,
                    message: `Twoja wizyta z dnia ${date} o godzinie ${time} została odwołana z powodu nieobecności lekarza.`,
                    type: 'CANCELLATION'
                };
            });

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

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

export const runAppointmentMaintenance = async () => {
    try {
        const now = new Date();

        const completedResult = await Appointment.updateMany(
            {
                status: 'BOOKED',
                $expr: {
                    $lt: [
                        { $add: ["$startTime", { $multiply: ["$durationMinutes", 60000] }] },
                        now
                    ]
                }
            },
            { $set: { status: 'COMPLETED' } }
        );

        if (completedResult.modifiedCount > 0) {
            console.log(`Auto-completed ${completedResult.modifiedCount} appointments.`);
        }

        const deletedResult = await Appointment.deleteMany({
            status: 'AVAILABLE',
            startTime: { $lt: now }
        });

        if (deletedResult.deletedCount > 0) {
            console.log(`Auto-deleted ${deletedResult.deletedCount} expired slots.`);
        }

    } catch (error) {
        console.error('Error running appointment maintenance:', error);
    }
};
