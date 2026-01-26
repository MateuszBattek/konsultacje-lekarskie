import { addDays, formatISO, setHours, setMinutes, startOfWeek } from 'date-fns';
import type { Appointment, User } from "../types";

export const DOCTORS: User[] = [
    { id: 'd1', name: 'dr Jan Kowalski', role: 'DOCTOR', specialization: 'Kardiolog' },
    { id: 'd2', name: 'dr Urszula Nowak', role: 'DOCTOR', specialization: 'Dermatolog' },
    { id: 'd3', name: 'dr Anna Wiśniewska', role: 'DOCTOR', specialization: 'Kardiolog' },
    { id: 'd4', name: 'dr Piotr Lewandowski', role: 'DOCTOR', specialization: 'Pediatra' },
    { id: 'd5', name: 'dr Maria Kamińska', role: 'DOCTOR', specialization: 'Neurolog' },
    { id: 'd6', name: 'dr Tomasz Zieliński', role: 'DOCTOR', specialization: 'Kardiolog' },
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

                    // Generate for multiple doctors (randomly select)
                    const doctor = DOCTORS[Math.floor(Math.random() * DOCTORS.length)];

                    apps.push({
                        id: `app-${doctor.id}-${formatISO(startTime)}`,
                        doctorId: doctor.id,
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