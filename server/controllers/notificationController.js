import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "User ID required" });

        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNotification = async (req, res) => {
    const notification = req.body;
    try {
        const newNotification = new Notification({
            ...notification,
            isRead: false,
            createdAt: new Date()
        });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
