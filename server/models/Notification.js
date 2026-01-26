import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['CANCELLATION', 'SYSTEM'],
        default: 'CANCELLATION'
    },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
