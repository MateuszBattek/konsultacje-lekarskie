import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import appointmentRoutes from './routes/appointmentRoutes.js';
import absenceRoutes from './routes/absenceRoutes.js';

dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

app.use('/api/appointments', appointmentRoutes);
app.use('/api/absences', absenceRoutes);

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.MONGODB_URI;

if (!CONNECTION_URL) {
    console.error('MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
    .catch((error) => console.log(`${error} did not connect`));
