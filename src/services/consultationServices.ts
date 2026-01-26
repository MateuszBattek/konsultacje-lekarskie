import type { Appointment, Absence } from '../types';
import initialData from '../data/db.json';

const STORAGE_KEY = 'lekarskie_konsultacje_data';

interface Database {
    appointments: Appointment[];
    absences: Absence[];
}

const getStoredData = (): Database => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ensure dates are correctly parsed if necessary, though ISO strings work fine with new Date()
            return parsed;
        } catch (e) {
            console.error('Failed to parse stored data', e);
        }
    }

    // Fallback to db.json seed
    return {
        appointments: initialData.appointments as Appointment[],
        absences: (initialData.absences || []).map((abs: any) => ({
            ...abs,
            startDate: new Date(abs.startDate),
            endDate: new Date(abs.endDate)
        }))
    };
};

const saveData = (data: Database) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const consultationService = {
    getAllAppointments: (): Appointment[] => {
        return getStoredData().appointments;
    },

    saveAppointments: (appointments: Appointment[]) => {
        const data = getStoredData();
        data.appointments = appointments;
        saveData(data);
    },

    getAllAbsences: (): Absence[] => {
        const data = getStoredData();
        return data.absences.map(abs => ({
            ...abs,
            startDate: new Date(abs.startDate),
            endDate: new Date(abs.endDate)
        }));
    },

    saveAbsences: (absences: Absence[]) => {
        const data = getStoredData();
        data.absences = absences;
        saveData(data);
    },

    clearAllData: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
