import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: String, required: true },
    patientId: { type: String },
    patientName: { type: String },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    status: {
        type: String,
        enum: ['AVAILABLE', 'PENDING_PAYMENT', 'BOOKED', 'COMPLETED', 'CANCELLED'],
        default: 'AVAILABLE'
    },
    type: {
        type: String,
        enum: ['CONSULTATION', 'FOLLOW_UP', 'PRESCRIPTION'],
        required: true
    },
    notes: { type: String },
    price: { type: Number },
    isSubSlot: { type: Boolean, default: false }
}, { timestamps: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
