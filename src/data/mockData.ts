import { isArbitraryPosition } from './../../node_modules/tailwind-merge/src/lib/validators';
import { addDays, formatISO, setHours, setMinutes, startOfWeek } from 'date-fns';
import type { Appointment, User } from "../types";

export const DOCTORS: User[] = [
    { id: 'd1', name: 'dr Jan Kowalski', role: 'DOCTOR', specialization: 'Kardiolog' },
    { id: 'd2', name: 'dr Urszula Nowak', role: 'DOCTOR', specialization: 'Dermatolog' },
]

export const PATIENTS: User[] = [
    { id: 'p1', name: "Michał Brązowy", role: 'PATIENT' },
    { id: 'p2', name: "Emilia Dawidowicz", role: 'PATIENT' },
]

const generateAppointments = (): Appointment[] => {
    const apps: Appointment[] = [];
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

    for (let i = -7; i < 14; i++) {
        const day = addDays(startOfCurrentWeek, i);

        if (day.getDay() === 0 || day.getDay() === 6) continue;

        for (let hour = 9; hour < 15; hour++) {
            [0, 30].forEach((minute) => {
                if (Math.random() > 0.3) {
                    const startTime = setMinutes(setHours(day, hour), minute);
                    const isPast = startTime < new Date();

                    let status: Appointment['status'] = 'AVAILABLE';
                    let patientId = undefined;
                    let type: Appointment['type'] = 'CONSULTATION';

                    const rand = Math.random();

                    if (isPast) {
                        status = rand > 0.2 ? 'COMPLETED' : 'CANCELLED';
                        if (status === 'COMPLETED') {
                            patientId = PATIENTS[Math.floor(Math.random() * PATIENTS.length)].id;
                        }
                    }
                    else {
                        if (rand > 0.7) {
                            status = "BOOKED";
                            patientId = PATIENTS[Math.floor(Math.random() * PATIENTS.length)].id;
                        }
                    }

                    if (Math.random() > 0.6) type = 'FOLLOW_UP';
                    else if (Math.random() > 0.8) type = 'PRESCRIPTION';

                    apps.push({
                        id: `app-${formatISO(startTime)}`,
                        doctorId: DOCTORS[0].id,
                        patientId,
                        startTime: formatISO(startTime),
                        durationMinutes: 30,
                        status,
                        type,
                        notes: status === 'BOOKED' ? 'Regular checkup' : undefined
                    })


                }
            })
        }
    }
    return apps;
}

export const MOCK_APPOINTMENTS = generateAppointments();