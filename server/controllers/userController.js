import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const secret = process.env.JWT_SECRET || 'test_secret';

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) return res.status(404).json({ message: "Taki użytkownik nie istnieje." });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Niepoprawne hasło." });

        const accessToken = jwt.sign(
            { email: existingUser.email, id: existingUser._id, role: existingUser.role },
            secret,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { email: existingUser.email, id: existingUser._id },
            secret,
            { expiresIn: "7d" }
        );

        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        res.status(200).json({
            result: existingUser,
            token: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: "Coś poszło nie tak." });
    }
};

export const signup = async (req, res) => {
    const { email, password, confirmPassword, firstName, lastName, role, specialization, dateOfBirth } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: "Taki użytkownik już istnieje." });

        if (password !== confirmPassword) return res.status(400).json({ message: "Hasła nie są identyczne." });

        const hashedPassword = await bcrypt.hash(password, 12);

        const accessToken = jwt.sign(
            { email, role: role || 'PATIENT' },
            secret,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { email },
            secret,
            { expiresIn: "7d" }
        );

        const result = await User.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: role || 'PATIENT',
            specialization: role === 'DOCTOR' ? specialization : undefined,
            dateOfBirth,
            refreshToken: refreshToken
        });

        res.status(200).json({
            result,
            token: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({ message: "Coś poszło nie tak." });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'DOCTOR' }).select('-password');
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Coś poszło nie tak." });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required." });
    }

    try {
        const decoded = jwt.verify(refreshToken, secret);

        const user = await User.findOne({ email: decoded.email });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token." });
        }

        const newAccessToken = jwt.sign(
            { email: user.email, id: user._id, role: user.role },
            secret,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired refresh token." });
    }
};

export const logout = async (req, res) => {
    const { userId } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { refreshToken: null });
        res.status(200).json({ message: "Wylogowano pomyślnie." });
    } catch (error) {
        res.status(500).json({ message: "Coś poszło nie tak." });
    }
};
