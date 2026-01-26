import type { Appointment, Absence } from '../types';

const BASE_URL = 'http://localhost:5000/api';

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
    getAllAppointments: async (): Promise<Appointment[]> => {
        const response = await fetch(`${BASE_URL}/appointments`);
        const data = await response.json();
        return data.map(mapAppointment);
    },

    createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const response = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });
        const data = await response.json();
        return mapAppointment(data);
    },

    bulkCreateAppointments: async (appointments: Omit<Appointment, 'id'>[]): Promise<Appointment[]> => {
        const response = await fetch(`${BASE_URL}/appointments/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointments)
        });
        const data = await response.json();
        return data.map(mapAppointment);
    },

    updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
        const response = await fetch(`${BASE_URL}/appointments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });
        const data = await response.json();
        return mapAppointment(data);
    },

    bulkUpdateAppointments: async (updates: { id: string, data: Partial<Appointment> }[]): Promise<void> => {
        await fetch(`${BASE_URL}/appointments/bulk`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
    },

    deleteAppointment: async (id: string): Promise<void> => {
        await fetch(`${BASE_URL}/appointments/${id}`, {
            method: 'DELETE'
        });
    },

    getAllAbsences: async (): Promise<Absence[]> => {
        const response = await fetch(`${BASE_URL}/absences`);
        const data = await response.json();
        return data.map(mapAbsence);
    },

    createAbsence: async (absence: Omit<Absence, 'id'>): Promise<Absence> => {
        const response = await fetch(`${BASE_URL}/absences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(absence)
        });
        const data = await response.json();
        return mapAbsence(data);
    },

    updateAbsence: async (id: string, absence: Partial<Absence>): Promise<Absence> => {
        const response = await fetch(`${BASE_URL}/absences/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(absence)
        });
        const data = await response.json();
        return mapAbsence(data);
    },

    deleteAbsence: async (id: string): Promise<void> => {
        await fetch(`${BASE_URL}/absences/${id}`, {
            method: 'DELETE'
        });
    }
};
