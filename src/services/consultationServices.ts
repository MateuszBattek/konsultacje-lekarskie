import type { Appointment, Absence, User, Notification } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const profile = localStorage.getItem('profile');
    const token = profile ? JSON.parse(profile).token : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...getHeaders()
        }
    });

    if (response.status === 401) {
        const profile = localStorage.getItem('profile');
        if (!profile) {
            localStorage.removeItem('profile');
            window.location.href = '/';
            throw new Error('Not authenticated');
        }

        const { refreshToken } = JSON.parse(profile);
        if (!refreshToken) {
            localStorage.removeItem('profile');
            window.location.href = '/';
            throw new Error('No refresh token');
        }

        try {
            const refreshResponse = await fetch(`${BASE_URL}/user/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!refreshResponse.ok) {
                localStorage.removeItem('profile');
                window.location.href = '/';
                throw new Error('Refresh token invalid');
            }

            const { token: newAccessToken } = await refreshResponse.json();

            const updatedProfile = {
                ...JSON.parse(profile),
                token: newAccessToken
            };
            localStorage.setItem('profile', JSON.stringify(updatedProfile));

            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newAccessToken}`
                }
            });
        } catch (error) {
            localStorage.removeItem('profile');
            window.location.href = '/';
            throw error;
        }
    }

    return response;
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

    checkSession: async (refreshToken: string): Promise<boolean> => {
        try {
            const response = await fetch(`${BASE_URL}/user/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    getDoctors: async (): Promise<User[]> => {
        const response = await fetch(`${BASE_URL}/user/doctors`);
        const data = await response.json();
        return data.map((doc: any) => ({
            ...doc,
            id: doc._id
        }));
    },

    getAllAppointments: async (doctorId?: string): Promise<Appointment[]> => {
        const url = doctorId
            ? `${BASE_URL}/appointments?doctorId=${doctorId}`
            : `${BASE_URL}/appointments`;
        const response = await fetchWithAuth(url);
        const data = await response.json();
        return data.map(mapAppointment);
    },

    createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const response = await fetchWithAuth(`${BASE_URL}/appointments`, {
            method: 'POST',
            body: JSON.stringify(appointment)
        });
        const data = await response.json();
        return mapAppointment(data);
    },

    bulkCreateAppointments: async (appointments: Omit<Appointment, 'id'>[]): Promise<Appointment[]> => {
        const response = await fetchWithAuth(`${BASE_URL}/appointments/bulk`, {
            method: 'POST',
            body: JSON.stringify(appointments)
        });
        const data = await response.json();
        return data.map(mapAppointment);
    },

    updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
        const response = await fetchWithAuth(`${BASE_URL}/appointments/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(appointment)
        });
        const data = await response.json();
        return mapAppointment(data);
    },

    bulkUpdateAppointments: async (updates: { id: string, data: Partial<Appointment> }[]): Promise<void> => {
        await fetchWithAuth(`${BASE_URL}/appointments/bulk`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    },

    deleteAppointment: async (id: string): Promise<void> => {
        await fetchWithAuth(`${BASE_URL}/appointments/${id}`, {
            method: 'DELETE'
        });
    },

    getAllAbsences: async (doctorId?: string): Promise<Absence[]> => {
        const url = doctorId
            ? `${BASE_URL}/absences?doctorId=${doctorId}`
            : `${BASE_URL}/absences`;
        const response = await fetchWithAuth(url);
        const data = await response.json();
        return data.map(mapAbsence);
    },

    createAbsence: async (absence: Omit<Absence, 'id'>): Promise<Absence> => {
        const response = await fetchWithAuth(`${BASE_URL}/absences`, {
            method: 'POST',
            body: JSON.stringify(absence)
        });
        const data = await response.json();
        return mapAbsence(data);
    },

    updateAbsence: async (id: string, absence: Partial<Absence>): Promise<Absence> => {
        const response = await fetchWithAuth(`${BASE_URL}/absences/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(absence)
        });
        const data = await response.json();
        return mapAbsence(data);
    },

    deleteAbsence: async (id: string): Promise<void> => {
        await fetchWithAuth(`${BASE_URL}/absences/${id}`, {
            method: 'DELETE'
        });
    },

    getNotifications: async (userId: string): Promise<Notification[]> => {
        const response = await fetchWithAuth(`${BASE_URL}/notifications?userId=${userId}`);
        return response.json();
    },

    createNotification: async (notification: Omit<Notification, '_id' | 'createdAt' | 'isRead'>): Promise<Notification> => {
        const response = await fetchWithAuth(`${BASE_URL}/notifications`, {
            method: 'POST',
            body: JSON.stringify(notification)
        });
        return response.json();
    },

    markNotificationRead: async (id: string): Promise<Notification> => {
        const response = await fetchWithAuth(`${BASE_URL}/notifications/${id}/read`, {
            method: 'PATCH'
        });
        return response.json();
    }
};
