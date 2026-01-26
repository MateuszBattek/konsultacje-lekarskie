import type { Appointment, Absence, User } from '../types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const profile = localStorage.getItem('profile');
    const token = profile ? JSON.parse(profile).token : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const mapAppointment = (apt: any): Appointment => ({
    ...apt,
    id: apt._id,
    startTime: apt.startTime
});

const mapAbsence = (abs: any): Absence => ({
    ...abs,
    id: abs._id,
    startDate: new Date(abs.startDate),
    endDate: new Date(abs.endDate)
});

export const consultationService = {
    // Auth
    signIn: async (formData: any) => {
        const response = await fetch(`${BASE_URL}/user/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        return response.json();
    },

    signUp: async (formData: any) => {
        const response = await fetch(`${BASE_URL}/user/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        return response.json();
    },

    getDoctors: async (): Promise<User[]> => {
        const response = await fetch(`${BASE_URL}/user/doctors`);
        const data = await response.json();
        return data.map((doc: any) => ({
            ...doc,
            id: doc._id
        }));
    },

    // Appointments
    getAllAppointments: async (doctorId?: string): Promise<Appointment[]> => {
        const url = doctorId
            ? `${BASE_URL}/appointments?doctorId=${doctorId}`
            : `${BASE_URL}/appointments`;
        const response = await fetch(url);
        const data = await response.json();
        return data.map(mapAppointment);
    },

    createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const response = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(appointment)
        });
        const data = await response.json();
        return mapAppointment(data);
    },

    bulkCreateAppointments: async (appointments: Omit<Appointment, 'id'>[]): Promise<Appointment[]> => {
        const response = await fetch(`${BASE_URL}/appointments/bulk`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(appointments)
        });
        const data = await response.json();
        return data.map(mapAppointment);
    },

    updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
        const response = await fetch(`${BASE_URL}/appointments/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(appointment)
        });
        const data = await response.json();
        return mapAppointment(data);
    },

    bulkUpdateAppointments: async (updates: { id: string, data: Partial<Appointment> }[]): Promise<void> => {
        await fetch(`${BASE_URL}/appointments/bulk`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
    },

    deleteAppointment: async (id: string): Promise<void> => {
        await fetch(`${BASE_URL}/appointments/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    },

    // Absences
    getAllAbsences: async (doctorId?: string): Promise<Absence[]> => {
        const url = doctorId
            ? `${BASE_URL}/absences?doctorId=${doctorId}`
            : `${BASE_URL}/absences`;
        const response = await fetch(url);
        const data = await response.json();
        return data.map(mapAbsence);
    },

    createAbsence: async (absence: Omit<Absence, 'id'>): Promise<Absence> => {
        const response = await fetch(`${BASE_URL}/absences`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(absence)
        });
        const data = await response.json();
        return mapAbsence(data);
    },

    updateAbsence: async (id: string, absence: Partial<Absence>): Promise<Absence> => {
        const response = await fetch(`${BASE_URL}/absences/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(absence)
        });
        const data = await response.json();
        return mapAbsence(data);
    },

    deleteAbsence: async (id: string): Promise<void> => {
        await fetch(`${BASE_URL}/absences/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    }
};
