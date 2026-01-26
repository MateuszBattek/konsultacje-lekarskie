import mongoose from 'mongoose';

const absenceSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String }
}, { timestamps: true });

export const Absence = mongoose.model('Absence', absenceSchema);
